package usecase

import (
    "todo-app/internal/notification/domain"
    "todo-app/internal/notification/repository"
)

type NotificationUseCase struct {
    repo repository.NotificationRepository
}

func NewNotificationUseCase(r repository.NotificationRepository) *NotificationUseCase {
    return &NotificationUseCase{repo: r}
}

func (uc *NotificationUseCase) CreateNotification(dto *NotificationDTO) (string, error) {
    n := domain.NewNotification(dto.ID, dto.Type, dto.Message, dto.UserID)
    if err := uc.repo.Create(n); err != nil {
        return "", err
    }
    return n.ID, nil
}
