package repository

import "todo-app/internal/user/domain"

type UserRepository interface {
    Create(user *domain.User) error
    FindByID(id string) (*domain.User, error)
    FindByEmail(email string) (*domain.User, error)
    Update(user *domain.User) error
    Delete(id string) error
}
