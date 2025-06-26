package domain

import (
    "time"
)

type Comment struct {
    ID        string    `json:"id"`
    Content   string    `json:"content"`
    TaskID    string    `json:"task_id"`
    AuthorID  string    `json:"author_id"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

func NewComment(id, content, taskID, authorID string) *Comment {
    return &Comment{
        ID:        id,
        Content:   content,
        TaskID:    taskID,
        AuthorID:  authorID,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }
}
