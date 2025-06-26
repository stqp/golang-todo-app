package repository

import (
	"todo-app/internal/project/domain"
	userdomain "todo-app/internal/user/domain"
)

type ProjectRepository interface {
	Create(project *domain.Project) error
	GetAll() ([]*domain.Project, error)
	GetByID(id string) (*domain.Project, error)
	FindByID(id string) (*domain.Project, error)
	Update(project *domain.Project) error
	Delete(id string) error
	GetMembers(projectID string) ([]*userdomain.User, error)
	AddMember(projectID, userID string) error
	RemoveMember(projectID, userID string) error
}
