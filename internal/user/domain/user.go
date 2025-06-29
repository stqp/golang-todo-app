package domain

import (
    "time"
)

type User struct {
    ID           string    `json:"id"`
    Name         string    `json:"name"`
    Email        string    `json:"email"`
    PasswordHash string    `json:"-"`
    RoleID       int       `json:"role_id"`
    RoleName     string    `json:"role_name"`
    Timezone     string    `json:"timezone"`
    Language     string    `json:"language"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

func NewUser(id, name, email, passwordHash, roleName, timezone, language string, roleID int) *User {
    return &User{
        ID:           id,
        Name:         name,
        Email:        email,
        PasswordHash: passwordHash,
        RoleID:       roleID,
        RoleName:     roleName,
        Timezone:     timezone,
        Language:     language,
        CreatedAt:    time.Now(),
        UpdatedAt:    time.Now(),
    }
}

// IsAdmin returns true if the user has admin role
func (u *User) IsAdmin() bool {
    return u.RoleName == "admin"
}

// GetCurrentTime returns the current time
func GetCurrentTime() time.Time {
    return time.Now()
}
