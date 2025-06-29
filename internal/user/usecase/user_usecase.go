package usecase

import (
	"todo-app/internal/common/errors"
	"todo-app/internal/infrastructure/auth"
	"todo-app/internal/user/domain"
	"todo-app/internal/user/repository"

	"github.com/google/uuid"
)

type UserUseCase struct {
	userRepo repository.UserRepository
	roleRepo repository.RoleRepository
}

func NewUserUseCase(userRepo repository.UserRepository, roleRepo repository.RoleRepository) *UserUseCase {
	return &UserUseCase{userRepo: userRepo, roleRepo: roleRepo}
}

func (uc *UserUseCase) Register(dto *UserDTO) (string, error) {
	if err := domain.ValidateEmail(dto.Email); err != nil {
		return "", err
	}
	// Use provided ID if it exists, otherwise generate a new UUID
	if dto.ID == "" {
		dto.ID = uuid.New().String()
	}
	hashed, _ := domain.HashPassword(dto.Password)
	
	// Get role name by ID
	role, err := uc.roleRepo.FindByID(dto.RoleID)
	if err != nil {
		return "", errors.ErrNotFound
	}
	
	user := domain.NewUser(dto.ID, dto.Name, dto.Email, hashed, role.Name, dto.Timezone, dto.Language, dto.RoleID)
	if err := uc.userRepo.Create(user); err != nil {
		return "", errors.ErrInternal
	}
	return user.ID, nil
}

func (uc *UserUseCase) Login(email, password string) (string, error) {
	user, err := uc.userRepo.FindByEmail(email)
	if err != nil {
		return "", errors.ErrNotFound
	}
	if !domain.CheckPassword(user.PasswordHash, password) {
		return "", errors.ErrUnauthorized
	}
	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		return "", errors.ErrInternal
	}
	return token, nil
}

func (uc *UserUseCase) GetUserByID(userID string) (*domain.User, error) {
	user, err := uc.userRepo.FindByID(userID)
	if err != nil {
		return nil, errors.ErrNotFound
	}
	return user, nil
}

func (uc *UserUseCase) GetAllUsers() ([]*domain.User, error) {
	users, err := uc.userRepo.FindAll()
	if err != nil {
		return nil, errors.ErrInternal
	}
	return users, nil
}

func (uc *UserUseCase) CreateUser(req *CreateUserRequest) (string, error) {
	if err := domain.ValidateEmail(req.Email); err != nil {
		return "", err
	}
	
	// Check if role exists
	role, err := uc.roleRepo.FindByID(req.RoleID)
	if err != nil {
		return "", errors.ErrNotFound
	}
	
	userID := uuid.New().String()
	hashed, _ := domain.HashPassword(req.Password)
	user := domain.NewUser(userID, req.Name, req.Email, hashed, role.Name, req.Timezone, req.Language, req.RoleID)
	
	if err := uc.userRepo.Create(user); err != nil {
		return "", errors.ErrInternal
	}
	return user.ID, nil
}

func (uc *UserUseCase) UpdateUser(req *UpdateUserRequest) error {
	// Check if user exists
	existingUser, err := uc.userRepo.FindByID(req.ID)
	if err != nil {
		return errors.ErrNotFound
	}
	
	// Check if role exists
	role, err := uc.roleRepo.FindByID(req.RoleID)
	if err != nil {
		return errors.ErrNotFound
	}
	
	// Update user fields
	existingUser.Name = req.Name
	existingUser.Email = req.Email
	existingUser.RoleID = req.RoleID
	existingUser.RoleName = role.Name
	existingUser.Timezone = req.Timezone
	existingUser.Language = req.Language
	existingUser.UpdatedAt = domain.GetCurrentTime()
	
	if err := uc.userRepo.Update(existingUser); err != nil {
		return errors.ErrInternal
	}
	return nil
}

func (uc *UserUseCase) DeleteUser(userID string) error {
	if err := uc.userRepo.Delete(userID); err != nil {
		return errors.ErrInternal
	}
	return nil
}

func (uc *UserUseCase) GetAllRoles() ([]*RoleDTO, error) {
	roles, err := uc.roleRepo.FindAll()
	if err != nil {
		return nil, errors.ErrInternal
	}
	
	var roleDTOs []*RoleDTO
	for _, role := range roles {
		roleDTOs = append(roleDTOs, &RoleDTO{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
		})
	}
	return roleDTOs, nil
}
