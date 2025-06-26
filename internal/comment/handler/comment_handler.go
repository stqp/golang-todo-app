package handler

import (
    "database/sql"
    "net/http"

    "github.com/go-chi/chi/v5"
    "todo-app/internal/common/utils"
    "todo-app/internal/comment/repository/postgres"
    "todo-app/internal/comment/usecase"
)

// RegisterCommentRoutes はコメント関連のエンドポイントを chi.Router に紐づける
// (router.go を使わず、ここ一か所で定義します)
func RegisterCommentRoutes(r chi.Router, db *sql.DB) {
    uc := usecase.NewCommentUseCase(postgres.NewCommentRepoPg(db))

    r.Route("/comments", func(r chi.Router) {
        r.Post("/", func(w http.ResponseWriter, r *http.Request) {
            var dto usecase.CommentDTO
            if err := utils.DecodeJSON(r, &dto); err != nil {
                utils.JSONResponse(w, http.StatusBadRequest, err.Error())
                return
            }
            id, err := uc.AddComment(&dto)
            if err != nil {
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            utils.JSONResponse(w, http.StatusCreated, map[string]string{"id": id})
        })
    })
}
