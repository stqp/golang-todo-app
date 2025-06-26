package handler

import (
    "database/sql"
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    "todo-app/internal/common/utils"
    "todo-app/internal/project/repository/postgres"
    "todo-app/internal/project/usecase"
    taskpostgres "todo-app/internal/task/repository/postgres"
    taskusecase "todo-app/internal/task/usecase"
)

func RegisterProjectRoutes(r chi.Router, db *sql.DB) {
    uc := usecase.NewProjectUseCase(postgres.NewProjectRepoPg(db))
    taskRepo := taskpostgres.NewTaskRepoPg(db)
    taskUC := taskusecase.NewTaskUseCase(taskRepo, taskpostgres.NewSubtaskRepoPg(db))

    r.Route("/projects", func(r chi.Router) {
        r.Get("/", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Get projects request received")
            
            projects, err := uc.GetAll()
            if err != nil {
                log.Printf("Failed to get projects: %v", err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("Projects retrieved successfully: %d projects", len(projects))
            utils.JSONResponse(w, http.StatusOK, projects)
        })

        r.Post("/", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Create project request received")
            
            // JWTトークンからユーザーIDを取得
            userID, ok := r.Context().Value("userID").(string)
            if !ok {
                log.Printf("Failed to get userID from context")
                utils.JSONResponse(w, http.StatusUnauthorized, "unauthorized")
                return
            }
            
            var dto usecase.ProjectDTO
            if err := utils.DecodeJSON(r, &dto); err != nil {
                log.Printf("Failed to decode project data: %v", err)
                utils.JSONResponse(w, http.StatusBadRequest, err.Error())
                return
            }
            
            // 作成者IDを設定
            dto.CreatedBy = userID
            
            id, err := uc.Create(&dto)
            if err != nil {
                log.Printf("Failed to create project: %v", err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("Project created successfully with ID: %s", id)
            utils.JSONResponse(w, http.StatusCreated, map[string]string{"id": id})
        })

        r.Get("/{projectID}", func(w http.ResponseWriter, r *http.Request) {
            projectID := chi.URLParam(r, "projectID")
            log.Printf("Get project request received for projectID: %s", projectID)
            
            project, err := uc.GetByID(projectID)
            if err != nil {
                log.Printf("Failed to get project %s: %v", projectID, err)
                utils.JSONResponse(w, http.StatusNotFound, "project not found")
                return
            }
            
            log.Printf("Project retrieved successfully: %s", projectID)
            utils.JSONResponse(w, http.StatusOK, project)
        })

        r.Get("/{projectID}/members", func(w http.ResponseWriter, r *http.Request) {
            projectID := chi.URLParam(r, "projectID")
            log.Printf("Get project members request received for projectID: %s", projectID)
            
            members, err := uc.GetMembers(projectID)
            if err != nil {
                log.Printf("Failed to get project members %s: %v", projectID, err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("Project members retrieved successfully: %s", projectID)
            utils.JSONResponse(w, http.StatusOK, members)
        })

        r.Get("/{projectID}/tasks", func(w http.ResponseWriter, r *http.Request) {
            projectID := chi.URLParam(r, "projectID")
            log.Printf("Get project tasks request received for projectID: %s", projectID)
            
            tasks, err := taskUC.GetTasksByProject(projectID)
            if err != nil {
                log.Printf("Failed to get project tasks %s: %v", projectID, err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("Project tasks retrieved successfully: %s", projectID)
            utils.JSONResponse(w, http.StatusOK, tasks)
        })

        r.Post("/{projectID}/members/{userID}", func(w http.ResponseWriter, r *http.Request) {
            projectID := chi.URLParam(r, "projectID")
            userID := chi.URLParam(r, "userID")
            log.Printf("Add member request received: projectID=%s, userID=%s", projectID, userID)
            
            if err := uc.AddMember(projectID, userID); err != nil {
                log.Printf("Failed to add member: %v", err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("Member added successfully: projectID=%s, userID=%s", projectID, userID)
            utils.JSONResponse(w, http.StatusOK, map[string]string{"status": "member added"})
        })
    })
}
