package usecase

import (
    "todo-app/internal/common/errors"
    "todo-app/internal/infrastructure/auth"
    "todo-app/internal/user/domain"
    "todo-app/internal/user/repository"
)

type UserUseCase struct {
    repo repository.UserRepository
}

func NewUserUseCase(r repository.UserRepository) *UserUseCase {
    return &UserUseCase{repo: r}
}

func (uc *UserUseCase) Register(dto *UserDTO) (string, error) {
    if err := domain.ValidateEmail(dto.Email); err != nil {
        return "", err
    }
    hashed, _ := domain.HashPassword(dto.Password)
    user := domain.NewUser(dto.ID, dto.Name, dto.Email, hashed, dto.Role, dto.Timezone, dto.Language)
    if err := uc.repo.Create(user); err != nil {
        return "", errors.ErrInternal
    }
    return user.ID, nil
}

func (uc *UserUseCase) Login(email, password string) (string, error) {
    user, err := uc.repo.FindByEmail(email)
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
    user, err := uc.repo.FindByID(userID)
    if err != nil {
        return nil, errors.ErrNotFound
    }
    return user, nil
}
