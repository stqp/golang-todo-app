package domain

import "time"

type Project struct {
    ID          string    `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    StartDate   time.Time `json:"start_date"`
    EndDate     time.Time `json:"end_date"`
    CreatedBy   string    `json:"created_by"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

func NewProject(id, name, description string, startDate, endDate time.Time, createdBy string) *Project {
    return &Project{
        ID:          id,
        Name:        name,
        Description: description,
        StartDate:   startDate,
        EndDate:     endDate,
        CreatedBy:   createdBy,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }
}
