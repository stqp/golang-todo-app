// File: internal/comment/repository/postgres/comment_repo_pg.go
package postgres

import (
    "database/sql"
    "todo-app/internal/comment/domain"
    "todo-app/internal/comment/repository"
)

// commentRepoPg は CommentRepository の PostgreSQL 実装（スタブ）
type commentRepoPg struct {
    db *sql.DB
}

// NewCommentRepoPg は postgres 用の CommentRepository を返す
func NewCommentRepoPg(db *sql.DB) repository.CommentRepository {
    return &commentRepoPg{db: db}
}

func (r *commentRepoPg) Create(c *domain.Comment) error {
    // TODO: 実際の SQL INSERT を書く
    return nil
}

func (r *commentRepoPg) FindByID(id string) (*domain.Comment, error) {
    // TODO: 実際の SQL SELECT を書く
    return &domain.Comment{}, nil
}

func (r *commentRepoPg) Delete(id string) error {
    // TODO: 実際の SQL DELETE を書く
    return nil
}

func (r *commentRepoPg) ListByTask(taskID string) ([]*domain.Comment, error) {
    // TODO: 実際の SQL SELECT を書く
    return []*domain.Comment{}, nil
}
