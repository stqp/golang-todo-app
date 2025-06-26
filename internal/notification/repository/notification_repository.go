package repository

import "todo-app/internal/notification/domain"

type NotificationRepository interface {
    Create(notification *domain.Notification) error
    ListByUser(userID string) ([]*domain.Notification, error)
    MarkAsRead(id string) error
}
