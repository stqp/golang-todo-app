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
    uc := usecase.NewUserUseCase(postgres.NewUserRepoPg(db), postgres.NewRoleRepoPg(db))

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

        // 管理者専用エンドポイント
        r.Get("/", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Get all users request received")
            
            // JWTミドルウェアからuserIDを取得
            userID, ok := r.Context().Value("userID").(string)
            if !ok {
                log.Printf("UserID not found in context")
                utils.JSONResponse(w, http.StatusUnauthorized, "unauthorized")
                return
            }
            
            // 管理者権限チェック
            currentUser, err := uc.GetUserByID(userID)
            if err != nil || !currentUser.IsAdmin() {
                log.Printf("User %s is not admin", userID)
                utils.JSONResponse(w, http.StatusForbidden, "admin access required")
                return
            }
            
            users, err := uc.GetAllUsers()
            if err != nil {
                log.Printf("Failed to get all users: %v", err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("All users retrieved successfully")
            utils.JSONResponse(w, http.StatusOK, users)
        })

        r.Post("/create", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Create user request received")
            
            // JWTミドルウェアからuserIDを取得
            userID, ok := r.Context().Value("userID").(string)
            if !ok {
                log.Printf("UserID not found in context")
                utils.JSONResponse(w, http.StatusUnauthorized, "unauthorized")
                return
            }
            
            // 管理者権限チェック
            currentUser, err := uc.GetUserByID(userID)
            if err != nil || !currentUser.IsAdmin() {
                log.Printf("User %s is not admin", userID)
                utils.JSONResponse(w, http.StatusForbidden, "admin access required")
                return
            }
            
            var req usecase.CreateUserRequest
            if err := utils.DecodeJSON(r, &req); err != nil {
                utils.JSONResponse(w, http.StatusBadRequest, err.Error())
                return
            }
            
            id, err := uc.CreateUser(&req)
            if err != nil {
                log.Printf("Failed to create user: %v", err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("User created successfully with ID: %s", id)
            utils.JSONResponse(w, http.StatusCreated, map[string]string{"id": id})
        })

        r.Put("/{userID}", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Update user request received")
            
            // JWTミドルウェアからuserIDを取得
            currentUserID, ok := r.Context().Value("userID").(string)
            if !ok {
                log.Printf("UserID not found in context")
                utils.JSONResponse(w, http.StatusUnauthorized, "unauthorized")
                return
            }
            
            // 管理者権限チェック
            currentUser, err := uc.GetUserByID(currentUserID)
            if err != nil || !currentUser.IsAdmin() {
                log.Printf("User %s is not admin", currentUserID)
                utils.JSONResponse(w, http.StatusForbidden, "admin access required")
                return
            }
            
            targetUserID := chi.URLParam(r, "userID")
            var req usecase.UpdateUserRequest
            if err := utils.DecodeJSON(r, &req); err != nil {
                utils.JSONResponse(w, http.StatusBadRequest, err.Error())
                return
            }
            req.ID = targetUserID
            
            if err := uc.UpdateUser(&req); err != nil {
                log.Printf("Failed to update user %s: %v", targetUserID, err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("User updated successfully: %s", targetUserID)
            utils.JSONResponse(w, http.StatusOK, map[string]string{"message": "user updated"})
        })

        r.Delete("/{userID}", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Delete user request received")
            
            // JWTミドルウェアからuserIDを取得
            currentUserID, ok := r.Context().Value("userID").(string)
            if !ok {
                log.Printf("UserID not found in context")
                utils.JSONResponse(w, http.StatusUnauthorized, "unauthorized")
                return
            }
            
            // 管理者権限チェック
            currentUser, err := uc.GetUserByID(currentUserID)
            if err != nil || !currentUser.IsAdmin() {
                log.Printf("User %s is not admin", currentUserID)
                utils.JSONResponse(w, http.StatusForbidden, "admin access required")
                return
            }
            
            targetUserID := chi.URLParam(r, "userID")
            
            if err := uc.DeleteUser(targetUserID); err != nil {
                log.Printf("Failed to delete user %s: %v", targetUserID, err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("User deleted successfully: %s", targetUserID)
            utils.JSONResponse(w, http.StatusOK, map[string]string{"message": "user deleted"})
        })

        r.Get("/roles", func(w http.ResponseWriter, r *http.Request) {
            log.Printf("Get all roles request received")
            
            // JWTミドルウェアからuserIDを取得
            userID, ok := r.Context().Value("userID").(string)
            if !ok {
                log.Printf("UserID not found in context")
                utils.JSONResponse(w, http.StatusUnauthorized, "unauthorized")
                return
            }
            
            // 管理者権限チェック
            currentUser, err := uc.GetUserByID(userID)
            if err != nil || !currentUser.IsAdmin() {
                log.Printf("User %s is not admin", userID)
                utils.JSONResponse(w, http.StatusForbidden, "admin access required")
                return
            }
            
            roles, err := uc.GetAllRoles()
            if err != nil {
                log.Printf("Failed to get all roles: %v", err)
                utils.JSONResponse(w, http.StatusInternalServerError, err.Error())
                return
            }
            
            log.Printf("All roles retrieved successfully")
            utils.JSONResponse(w, http.StatusOK, roles)
        })
    })
}
