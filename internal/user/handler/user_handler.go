package handler

import (
    "database/sql"
    "log"
    "net/http"

    "github.com/go-chi/chi/v5"
    "todo-app/internal/common/utils"
    "todo-app/internal/user/repository/postgres"
    "todo-app/internal/user/usecase"
)

func RegisterUserRoutes(r chi.Router, db *sql.DB) {
    uc := usecase.NewUserUseCase(postgres.NewUserRepoPg(db))

    r.Route("/users", func(r chi.Router) {
        r.Post("/register", func(w http.ResponseWriter, r *http.Request) {
            var dto usecase.UserDTO
            if err := utils.DecodeJSON(r, &dto); err != nil {
                utils.JSONResponse(w, http.StatusBadRequest, err.Error())
                return
            }
            id, err := uc.Register(&dto)
            if err != nil {
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            utils.JSONResponse(w, http.StatusCreated, map[string]string{"id": id})
        })

        r.Post("/login", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Login attempt received")
            
            var creds struct { Email, Password string }
            if err := utils.DecodeJSON(r, &creds); err != nil {
                log.Printf("Failed to decode login credentials: %v", err)
                utils.JSONResponse(w, http.StatusBadRequest, err.Error())
                return
            }
            
            log.Printf("Login attempt for email: %s", creds.Email)
            
            token, err := uc.Login(creds.Email, creds.Password)
            if err != nil {
                log.Printf("Login failed for email %s: %v", creds.Email, err)
                utils.JSONResponse(w, http.StatusUnauthorized, err.Error())
                return
            }
            
            log.Printf("Login successful for email: %s", creds.Email)
            utils.JSONResponse(w, http.StatusOK, map[string]string{"token": token})
        })

        r.Get("/me", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Get user info request received")
            
            // JWTミドルウェアからuserIDを取得
            userID, ok := r.Context().Value("userID").(string)
            if !ok {
                log.Printf("UserID not found in context")
                utils.JSONResponse(w, http.StatusUnauthorized, "unauthorized")
                return
            }
            
            log.Printf("Getting user info for userID: %s", userID)
            
            user, err := uc.GetUserByID(userID)
            if err != nil {
                log.Printf("Failed to get user info for userID %s: %v", userID, err)
                utils.JSONResponse(w, http.StatusNotFound, "user not found")
                return
            }
            
            log.Printf("User info retrieved successfully for userID: %s", userID)
            utils.JSONResponse(w, http.StatusOK, user)
        })
    })
}
