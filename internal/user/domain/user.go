package domain

import (
    "time"
)

type User struct {
    ID           string    `json:"id"`
    Name         string    `json:"name"`
    Email        string    `json:"email"`
    PasswordHash string    `json:"-"`
    Role         string    `json:"role"`
    Timezone     string    `json:"timezone"`
    Language     string    `json:"language"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

func NewUser(id, name, email, passwordHash, role, timezone, language string) *User {
    return &User{
        ID:           id,
        Name:         name,
        Email:        email,
        PasswordHash: passwordHash,
        Role:         role,
        Timezone:     timezone,
        Language:     language,
        CreatedAt:    time.Now(),
        UpdatedAt:    time.Now(),
    }
}
