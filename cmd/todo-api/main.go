// File: cmd/todo-api/main.go
package main

import (
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    chiMiddleware "github.com/go-chi/chi/v5/middleware"
    userHandler "todo-app/internal/user/handler"
    projectHandler "todo-app/internal/project/handler"
    taskHandler "todo-app/internal/task/handler"
    commentHandler "todo-app/internal/comment/handler"
    notificationHandler "todo-app/internal/notification/handler"
    "todo-app/internal/common/logger"
    authMiddleware "todo-app/internal/common/middleware"
    "todo-app/internal/infrastructure/db"
)

func main() {
    // Logger initialization
    zapLogger := logger.NewLogger()
    defer zapLogger.Sync()
    zapLogger.Info("Starting TODO API server...")

    // Initialize database using environment variable or default
    dbConn, err := db.InitializePostgres()
    if err != nil {
        log.Fatalf("failed to initialize database: %v", err)
    }
    defer dbConn.Close()

    // Initialize router
    r := chi.NewRouter()
    r.Use(chiMiddleware.Logger)
    r.Use(authMiddleware.JWTMiddleware)

    // Register routes
    userHandler.RegisterUserRoutes(r, dbConn)
    projectHandler.RegisterProjectRoutes(r, dbConn)
    taskHandler.RegisterTaskRoutes(r, dbConn)
    commentHandler.RegisterCommentRoutes(r, dbConn)
    notificationHandler.RegisterNotificationRoutes(r, dbConn)

    zapLogger.Info("Listening on :8080")
    http.ListenAndServe(":8080", r)
}