package postgres

import (
    "database/sql"
    "todo-app/internal/user/domain"
    "todo-app/internal/user/repository"
)

type roleRepoPg struct {
    db *sql.DB
}

func NewRoleRepoPg(db *sql.DB) repository.RoleRepository {
    return &roleRepoPg{db: db}
}

func (r *roleRepoPg) FindByID(id int) (*domain.Role, error) {
    query := `SELECT id, name, description, created_at FROM roles WHERE id = $1`
    role := &domain.Role{}
    err := r.db.QueryRow(query, id).Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt)
    if err != nil {
        return nil, err
    }
    return role, nil
}

func (r *roleRepoPg) FindByName(name string) (*domain.Role, error) {
    query := `SELECT id, name, description, created_at FROM roles WHERE name = $1`
    role := &domain.Role{}
    err := r.db.QueryRow(query, name).Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt)
    if err != nil {
        return nil, err
    }
    return role, nil
}

func (r *roleRepoPg) FindAll() ([]*domain.Role, error) {
    query := `SELECT id, name, description, created_at FROM roles ORDER BY id`
    rows, err := r.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var roles []*domain.Role
    for rows.Next() {
        role := &domain.Role{}
        err := rows.Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt)
        if err != nil {
            return nil, err
        }
        roles = append(roles, role)
    }
    return roles, nil
} 