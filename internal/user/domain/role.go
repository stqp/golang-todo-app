package domain

import (
    "time"
)

type Role struct {
    ID          int       `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"created_at"`
}

func NewRole(id int, name, description string) *Role {
    return &Role{
        ID:          id,
        Name:        name,
        Description: description,
        CreatedAt:   time.Now(),
    }
} 