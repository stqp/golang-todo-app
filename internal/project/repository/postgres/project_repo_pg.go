package postgres

import (
	"database/sql"
	"fmt"
	"todo-app/internal/project/domain"
	"todo-app/internal/project/repository"
	userdomain "todo-app/internal/user/domain"
)

type projectRepoPg struct {
	db *sql.DB
}

func NewProjectRepoPg(db *sql.DB) repository.ProjectRepository {
	return &projectRepoPg{db: db}
}

func (r *projectRepoPg) Create(project *domain.Project) error {
	query := `
        INSERT INTO projects (id, name, description, start_date, end_date, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `
	_, err := r.db.Exec(query, project.ID, project.Name, project.Description, project.StartDate, project.EndDate, project.CreatedBy)
	return err
}

func (r *projectRepoPg) GetAll() ([]*domain.Project, error) {
	query := `
        SELECT id, name, description, start_date, end_date, created_by, created_at, updated_at
        FROM projects
        ORDER BY created_at DESC
    `
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*domain.Project
	for rows.Next() {
		project := &domain.Project{}
		err := rows.Scan(&project.ID, &project.Name, &project.Description, &project.StartDate, &project.EndDate, &project.CreatedBy, &project.CreatedAt, &project.UpdatedAt)
		if err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}
	return projects, nil
}

func (r *projectRepoPg) GetByID(id string) (*domain.Project, error) {
	query := `
        SELECT id, name, description, start_date, end_date, created_by, created_at, updated_at
        FROM projects
        WHERE id = $1
    `
	project := &domain.Project{}
	err := r.db.QueryRow(query, id).Scan(&project.ID, &project.Name, &project.Description, &project.StartDate, &project.EndDate, &project.CreatedBy, &project.CreatedAt, &project.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("project not found")
		}
		return nil, err
	}
	return project, nil
}

func (r *projectRepoPg) FindByID(id string) (*domain.Project, error) {
	return r.GetByID(id)
}

func (r *projectRepoPg) GetMembers(projectID string) ([]*userdomain.User, error) {
	query := `
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.timezone, u.language, u.created_at, u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        INNER JOIN project_members pm ON u.id = pm.user_id
        WHERE pm.project_id = $1
        ORDER BY u.name
    `
	rows, err := r.db.Query(query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*userdomain.User
	for rows.Next() {
		user := &userdomain.User{}
		err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.RoleID, &user.RoleName, &user.Timezone, &user.Language, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (r *projectRepoPg) Update(project *domain.Project) error {
	// TODO: UPDATE
	return nil
}

func (r *projectRepoPg) Delete(id string) error {
	query := `DELETE FROM projects WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("project not found")
	}

	return nil
}

func (r *projectRepoPg) AddMember(projectID, userID string) error {
	// TODO: INSERT into project_members
	return nil
}

func (r *projectRepoPg) RemoveMember(projectID, userID string) error {
	// TODO: DELETE from project_members
	return nil
}
