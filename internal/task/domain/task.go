package domain

import (
    "time"
)

type Task struct {
    ID          string    `json:"id"`
    Title       string    `json:"title"`
    Description string    `json:"description"`
    DueDate     time.Time `json:"due_date"`
    Priority    string    `json:"priority"`
    Status      string    `json:"status"`
    CreatedBy   string    `json:"created_by"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    ProjectID   string    `json:"project_id"`
    AssigneeID  string    `json:"assignee_id"`
}

func NewTask(id, title, description, projectID, assigneeID string, dueDate time.Time, priority, status string, createdBy string) *Task {
    return &Task{
        ID:          id,
        Title:       title,
        Description: description,
        DueDate:     dueDate,
        Priority:    priority,
        Status:      status,
        CreatedBy:   createdBy,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
        ProjectID:   projectID,
        AssigneeID:  assigneeID,
    }
}
