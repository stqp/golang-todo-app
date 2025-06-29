package repository

import "todo-app/internal/user/domain"

type RoleRepository interface {
    FindByID(id int) (*domain.Role, error)
    FindByName(name string) (*domain.Role, error)
    FindAll() ([]*domain.Role, error)
} 