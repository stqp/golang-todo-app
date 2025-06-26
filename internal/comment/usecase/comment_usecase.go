package usecase

import (
    "todo-app/internal/comment/domain"
    "todo-app/internal/comment/repository"
)

type CommentUseCase struct {
    repo repository.CommentRepository
}

func NewCommentUseCase(r repository.CommentRepository) *CommentUseCase {
    return &CommentUseCase{repo: r}
}

func (uc *CommentUseCase) AddComment(dto *CommentDTO) (string, error) {
    comment := domain.NewComment(dto.ID, dto.Content, dto.TaskID, dto.AuthorID)
    if err := uc.repo.Create(comment); err != nil {
        return "", err
    }
    return comment.ID, nil
}
