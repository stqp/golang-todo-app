package repository

import "todo-app/internal/comment/domain"

type CommentRepository interface {
    Create(comment *domain.Comment) error
    FindByID(id string) (*domain.Comment, error)
    Delete(id string) error
    ListByTask(taskID string) ([]*domain.Comment, error)
}
