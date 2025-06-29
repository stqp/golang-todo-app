package handler

import (
	"database/sql"
	"log"
	"net/http"

	"todo-app/internal/common/utils"
	"todo-app/internal/task/repository/postgres"
	"todo-app/internal/task/usecase"

	"github.com/go-chi/chi/v5"
)

func RegisterTaskRoutes(r chi.Router, db *sql.DB) {
	taskRepo := postgres.NewTaskRepoPg(db)
	subtaskRepo := postgres.NewSubtaskRepoPg(db) // ← こちらを呼び出す
	uc := usecase.NewTaskUseCase(taskRepo, subtaskRepo)

	r.Route("/tasks", func(r chi.Router) {
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			log.Printf("Get tasks request received")

			tasks, err := uc.GetAllTasks()
			if err != nil {
				log.Printf("Failed to get tasks: %v", err)
				utils.JSONResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
				return
			}

			log.Printf("Tasks retrieved successfully: %d tasks", len(tasks))
			utils.JSONResponse(w, http.StatusOK, tasks)
		})

		r.Get("/{taskID}", func(w http.ResponseWriter, r *http.Request) {
			taskID := chi.URLParam(r, "taskID")
			log.Printf("Get task request received for taskID: %s", taskID)

			task, err := uc.GetTaskByID(taskID)
			if err != nil {
				log.Printf("Failed to get task %s: %v", taskID, err)
				utils.JSONResponse(w, http.StatusNotFound, map[string]string{"error": "task not found"})
				return
			}

			log.Printf("Task retrieved successfully: %s", taskID)
			utils.JSONResponse(w, http.StatusOK, task)
		})

		r.Post("/", func(w http.ResponseWriter, r *http.Request) {
			log.Printf("Create task request received")
			log.Printf("=== UPDATED CODE IS RUNNING ===")

			// JWTトークンからユーザーIDを取得
			userID, ok := r.Context().Value("userID").(string)
			if !ok {
				log.Printf("Failed to get userID from context")
				utils.JSONResponse(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
				return
			}

			var dto usecase.TaskDTO
			if err := utils.DecodeJSON(r, &dto); err != nil {
				log.Printf("Failed to decode task data: %v", err)
				utils.JSONResponse(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}

			log.Printf("DTO before setting CreatedBy - ID: '%s', Title: '%s'", dto.ID, dto.Title)

			// 作成者IDを設定
			dto.CreatedBy = userID

			log.Printf("DTO after setting CreatedBy - ID: '%s', Title: '%s', CreatedBy: '%s'", dto.ID, dto.Title, dto.CreatedBy)

			id, err := uc.CreateTask(&dto)
			if err != nil {
				log.Printf("Failed to create task: %v", err)
				utils.JSONResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
				return
			}

			log.Printf("Task created successfully with ID: '%s'", id)
			utils.JSONResponse(w, http.StatusCreated, map[string]string{"id": id})
		})

		r.Post("/{taskID}/subtasks", func(w http.ResponseWriter, r *http.Request) {
			taskID := chi.URLParam(r, "taskID")
			log.Printf("Create subtask request received for taskID: %s", taskID)

			var dto usecase.SubtaskDTO
			if err := utils.DecodeJSON(r, &dto); err != nil {
				log.Printf("Failed to decode subtask data: %v", err)
				utils.JSONResponse(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}

			dto.TaskID = taskID
			id, err := uc.CreateSubtask(&dto)
			if err != nil {
				log.Printf("Failed to create subtask: %v", err)
				utils.JSONResponse(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
				return
			}

			log.Printf("Subtask created successfully with ID: %s", id)
			utils.JSONResponse(w, http.StatusCreated, map[string]string{"id": id})
		})

		r.Delete("/{taskID}", func(w http.ResponseWriter, r *http.Request) {
			taskID := chi.URLParam(r, "taskID")
			log.Printf("Delete task request received for taskID: %s", taskID)

			err := uc.DeleteTask(taskID)
			if err != nil {
				log.Printf("Failed to delete task %s: %v", taskID, err)
				utils.JSONResponse(w, http.StatusNotFound, map[string]string{"error": "task not found"})
				return
			}

			log.Printf("Task deleted successfully: %s", taskID)
			utils.JSONResponse(w, http.StatusOK, map[string]string{"message": "task deleted successfully"})
		})
	})
}
