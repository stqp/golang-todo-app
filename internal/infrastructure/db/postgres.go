package db

import (
    "database/sql"
    "log"
    "os"
    _ "github.com/lib/pq"
)

// InitializePostgres connects to PostgreSQL using DB_DSN environment variable
// or defaults to local settings for development.
func InitializePostgres() (*sql.DB, error) {
    connStr := os.Getenv("DB_DSN")
    if connStr == "" {
        connStr = "postgres://todo_user:todo_pass@localhost:5432/todoapp?sslmode=disable"
    }
    
    log.Printf("Connecting to database with connection string: %s", connStr)
    
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Printf("Failed to open database connection: %v", err)
        return nil, err
    }
    
    log.Printf("Attempting to ping database...")
    if err := db.Ping(); err != nil {
        log.Printf("Failed to ping database: %v", err)
        return nil, err
    }
    
    log.Printf("Successfully connected to database")
    return db, nil
}