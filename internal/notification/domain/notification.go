package domain

import (
    "time"
)

type Notification struct {
    ID        string    `json:"id"`
    Type      string    `json:"type"`
    Message   string    `json:"message"`
    UserID    string    `json:"user_id"`
    IsRead    bool      `json:"is_read"`
    CreatedAt time.Time `json:"created_at"`
}

func NewNotification(id, ntype, message, userID string) *Notification {
    return &Notification{
        ID:        id,
        Type:      ntype,
        Message:   message,
        UserID:    userID,
        IsRead:    false,
        CreatedAt: time.Now(),
    }
}
