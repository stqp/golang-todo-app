package handler

import (
    "database/sql"
    "net/http"

    "github.com/go-chi/chi/v5"
    "todo-app/internal/common/utils"
    "todo-app/internal/notification/repository/postgres"
    "todo-app/internal/notification/usecase"
)

func RegisterNotificationRoutes(r chi.Router, db *sql.DB) {
    uc := usecase.NewNotificationUseCase(postgres.NewNotificationRepoPg(db))

    r.Route("/notifications", func(r chi.Router) {
        r.Post("/", func(w http.ResponseWriter, r *http.Request) {
            var dto usecase.NotificationDTO
            if err := utils.DecodeJSON(r, &dto); err != nil {
                utils.JSONResponse(w, http.StatusBadRequest, err.Error())
                return
            }
            id, err := uc.CreateNotification(&dto)
            if err != nil {
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            utils.JSONResponse(w, http.StatusCreated, map[string]string{"id": id})
        })
    })
}
