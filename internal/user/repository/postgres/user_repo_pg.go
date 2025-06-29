package postgres

import (
    "database/sql"
    "log"
    "todo-app/internal/user/domain"
    "todo-app/internal/user/repository"
)

type userRepoPg struct {
    db *sql.DB
}

func NewUserRepoPg(db *sql.DB) repository.UserRepository {
    return &userRepoPg{db: db}
}

func (r *userRepoPg) Create(user *domain.User) error {
    query := `
        INSERT INTO users (id, name, email, password_hash, role_id, timezone, language, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `
    _, err := r.db.Exec(query, user.ID, user.Name, user.Email, user.PasswordHash, user.RoleID, user.Timezone, user.Language, user.CreatedAt, user.UpdatedAt)
    return err
}

func (r *userRepoPg) FindByID(id string) (*domain.User, error) {
    query := `
        SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name as role_name, u.timezone, u.language, u.created_at, u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
    `
    user := &domain.User{}
    err := r.db.QueryRow(query, id).Scan(
        &user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.RoleID, &user.RoleName, &user.Timezone, &user.Language, &user.CreatedAt, &user.UpdatedAt,
    )
    if err != nil {
        return nil, err
    }
    return user, nil
}

func (r *userRepoPg) FindByEmail(email string) (*domain.User, error) {
    log.Printf("Searching for user with email: %s", email)
    
    query := `
        SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name as role_name, u.timezone, u.language, u.created_at, u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
    `
    user := &domain.User{}
    err := r.db.QueryRow(query, email).Scan(
        &user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.RoleID, &user.RoleName, &user.Timezone, &user.Language, &user.CreatedAt, &user.UpdatedAt,
    )
    if err != nil {
        log.Printf("User not found for email %s: %v", email, err)
        return nil, err
    }
    
    log.Printf("User found for email %s: %s", email, user.Name)
    return user, nil
}

func (r *userRepoPg) Update(user *domain.User) error {
    query := `
        UPDATE users 
        SET name = $2, email = $3, password_hash = $4, role_id = $5, timezone = $6, language = $7, updated_at = $8
        WHERE id = $1
    `
    _, err := r.db.Exec(query, user.ID, user.Name, user.Email, user.PasswordHash, user.RoleID, user.Timezone, user.Language, user.UpdatedAt)
    return err
}

func (r *userRepoPg) Delete(id string) error {
    query := `DELETE FROM users WHERE id = $1`
    _, err := r.db.Exec(query, id)
    return err
}

func (r *userRepoPg) FindAll() ([]*domain.User, error) {
    query := `
        SELECT u.id, u.name, u.email, u.password_hash, u.role_id, r.name as role_name, u.timezone, u.language, u.created_at, u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
    `
    rows, err := r.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []*domain.User
    for rows.Next() {
        user := &domain.User{}
        err := rows.Scan(
            &user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.RoleID, &user.RoleName, &user.Timezone, &user.Language, &user.CreatedAt, &user.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }
        users = append(users, user)
    }
    return users, nil
}
