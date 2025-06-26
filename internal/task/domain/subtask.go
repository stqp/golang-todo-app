package domain

import (
    "time"
)

type Subtask struct {
    ID         string    `json:"id"`
    Title      string    `json:"title"`
    IsComplete bool      `json:"is_complete"`
    CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
    TaskID     string    `json:"task_id"`
}

func NewSubtask(id, title, taskID string) *Subtask {
    return &Subtask{
        ID:         id,
        Title:      title,
        IsComplete: false,
        CreatedAt:  time.Now(),
        UpdatedAt:  time.Now(),
        TaskID:     taskID,
    }
}
