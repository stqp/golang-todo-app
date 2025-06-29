package usecase

type UserDTO struct {
    ID       string `json:"id"`
    Name     string `json:"name"`
    Email    string `json:"email"`
    Password string `json:"password"`
    RoleID   int    `json:"role_id"`
    RoleName string `json:"role_name"`
    Timezone string `json:"timezone"`
    Language string `json:"language"`
}

type CreateUserRequest struct {
    Name     string `json:"name" validate:"required"`
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=6"`
    RoleID   int    `json:"role_id" validate:"required"`
    Timezone string `json:"timezone"`
    Language string `json:"language"`
}

type UpdateUserRequest struct {
    ID       string `json:"id" validate:"required"`
    Name     string `json:"name" validate:"required"`
    Email    string `json:"email" validate:"required,email"`
    RoleID   int    `json:"role_id" validate:"required"`
    Timezone string `json:"timezone"`
    Language string `json:"language"`
}

type RoleDTO struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
}
