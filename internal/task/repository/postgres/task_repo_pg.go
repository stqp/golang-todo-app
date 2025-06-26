package postgres

import (
    "database/sql"
    "fmt"
    "todo-app/internal/task/domain"
    "todo-app/internal/task/repository"
)

type taskRepoPg struct { db *sql.DB }

func NewTaskRepoPg(db *sql.DB) repository.TaskRepository {
    return &taskRepoPg{db: db}
}

func (r *taskRepoPg) Create(task *domain.Task) error {
    query := `
        INSERT INTO tasks (id, title, description, project_id, assignee_id, due_date, priority, status, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `
    _, err := r.db.Exec(query, task.ID, task.Title, task.Description, task.ProjectID, task.AssigneeID, task.DueDate, task.Priority, task.Status, task.CreatedBy)
    return err
}

func (r *taskRepoPg) GetAll() ([]*domain.Task, error) {
    query := `
        SELECT id, title, description, project_id, assignee_id, due_date, priority, status, created_by, created_at, updated_at
        FROM tasks
        ORDER BY created_at DESC
    `
    rows, err := r.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var tasks []*domain.Task
    for rows.Next() {
        task := &domain.Task{}
        err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.ProjectID, &task.AssigneeID, &task.DueDate, &task.Priority, &task.Status, &task.CreatedBy, &task.CreatedAt, &task.UpdatedAt)
        if err != nil {
            return nil, err
        }
        tasks = append(tasks, task)
    }
    return tasks, nil
}

func (r *taskRepoPg) GetByID(id string) (*domain.Task, error) {
    query := `
        SELECT id, title, description, project_id, assignee_id, due_date, priority, status, created_by, created_at, updated_at
        FROM tasks
        WHERE id = $1
    `
    task := &domain.Task{}
    err := r.db.QueryRow(query, id).Scan(&task.ID, &task.Title, &task.Description, &task.ProjectID, &task.AssigneeID, &task.DueDate, &task.Priority, &task.Status, &task.CreatedBy, &task.CreatedAt, &task.UpdatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, fmt.Errorf("task not found")
        }
        return nil, err
    }
    return task, nil
}

func (r *taskRepoPg) FindByID(id string) (*domain.Task, error) {
    return r.GetByID(id)
}

func (r *taskRepoPg) Update(task *domain.Task) error {
    // TODO: UPDATE
    return nil
}

func (r *taskRepoPg) Delete(id string) error {
    // TODO: DELETE
    return nil
}

func (r *taskRepoPg) ListByProject(projectID string) ([]*domain.Task, error) {
    query := `
        SELECT id, title, description, project_id, assignee_id, due_date, priority, status, created_by, created_at, updated_at
        FROM tasks
        WHERE project_id = $1
        ORDER BY created_at DESC
    `
    rows, err := r.db.Query(query, projectID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var tasks []*domain.Task
    for rows.Next() {
        task := &domain.Task{}
        err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.ProjectID, &task.AssigneeID, &task.DueDate, &task.Priority, &task.Status, &task.CreatedBy, &task.CreatedAt, &task.UpdatedAt)
        if err != nil {
            return nil, err
        }
        tasks = append(tasks, task)
    }
    return tasks, nil
}

// ここからが SubtaskRepository の実装

// NewSubtaskRepoPg は PostgreSQL 実装（サブタスク用）を返す
func NewSubtaskRepoPg(db *sql.DB) repository.SubtaskRepository {
    return &subtaskRepoPg{db: db}
}

// subtaskRepoPg は SubtaskRepository の PostgreSQL 実装
type subtaskRepoPg struct { db *sql.DB }

func (r *subtaskRepoPg) Create(subtask *domain.Subtask) error {
    // TODO: SQL INSERT
    return nil
}
func (r *subtaskRepoPg) FindByID(id string) (*domain.Subtask, error) {
    // TODO: SQL SELECT
    return &domain.Subtask{}, nil
}
func (r *subtaskRepoPg) Update(subtask *domain.Subtask) error {
    // TODO: SQL UPDATE
    return nil
}
func (r *subtaskRepoPg) Delete(id string) error {
    // TODO: SQL DELETE
    return nil
}
func (r *subtaskRepoPg) ListByTask(taskID string) ([]*domain.Subtask, error) {
    // TODO: SQL SELECT
    return []*domain.Subtask{}, nil
}