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
    searchHandler "todo-app/internal/infrastructure"
    "github.com/go-chi/cors"
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
    
    // ミドルウェアを先に定義
    r.Use(chiMiddleware.Logger)
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
        AllowCredentials: true,
    }))

    // 認証必須のルート
    r.Group(func(private chi.Router) {
        private.Use(authMiddleware.JWTMiddleware)
        searchHandler.RegisterSearchRoutes(private)
        userHandler.RegisterUserRoutes(private, dbConn)
        projectHandler.RegisterProjectRoutes(private, dbConn)
        taskHandler.RegisterTaskRoutes(private, dbConn)
        commentHandler.RegisterCommentRoutes(private, dbConn)
        notificationHandler.RegisterNotificationRoutes(private, dbConn)
    })

    zapLogger.Info("Listening on :8080")
    http.ListenAndServe(":8080", r)
}