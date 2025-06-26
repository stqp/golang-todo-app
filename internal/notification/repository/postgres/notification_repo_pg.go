// File: internal/notification/repository/postgres/notification_repo_pg.go
package postgres

import (
    "database/sql"
    "todo-app/internal/notification/domain"
    "todo-app/internal/notification/repository"
)

// notificationRepoPg は NotificationRepository の PostgreSQL 実装（スタブ）
type notificationRepoPg struct {
    db *sql.DB
}

// NewNotificationRepoPg は postgres 用の NotificationRepository を返す
func NewNotificationRepoPg(db *sql.DB) repository.NotificationRepository {
    return &notificationRepoPg{db: db}
}

func (r *notificationRepoPg) Create(n *domain.Notification) error {
    // TODO: 実際の SQL INSERT を書く
    return nil
}

func (r *notificationRepoPg) ListByUser(userID string) ([]*domain.Notification, error) {
    // TODO: 実際の SQL SELECT を書く
    return []*domain.Notification{}, nil
}

func (r *notificationRepoPg) MarkAsRead(id string) error {
    // TODO: 実際の SQL UPDATE を書く
    return nil
}
