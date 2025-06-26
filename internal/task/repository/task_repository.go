package repository

import "todo-app/internal/task/domain"

type TaskRepository interface {
    Create(task *domain.Task) error
    GetAll() ([]*domain.Task, error)
    GetByID(id string) (*domain.Task, error)
    FindByID(id string) (*domain.Task, error)
    Update(task *domain.Task) error
    Delete(id string) error
    ListByProject(projectID string) ([]*domain.Task, error) 
}

type SubtaskRepository interface {
    Create(subtask *domain.Subtask) error
    FindByID(id string) (*domain.Subtask, error)
    Update(subtask *domain.Subtask) error
    Delete(id string) error
    ListByTask(taskID string) ([]*domain.Subtask, error)
}
