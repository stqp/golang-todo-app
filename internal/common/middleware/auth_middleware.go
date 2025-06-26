package middleware

import (
    "context"
    "net/http"
    "strings"

    "todo-app/internal/infrastructure/auth"
)

func JWTMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 認証不要なエンドポイントをチェック
        if isPublicEndpoint(r.Method, r.URL.Path) {
            next.ServeHTTP(w, r)
            return
        }

        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "missing token", http.StatusUnauthorized)
            return
        }
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            http.Error(w, "invalid token format", http.StatusUnauthorized)
            return
        }
        tokenStr := parts[1]
        userID, err := auth.ValidateToken(tokenStr)
        if err != nil {
            http.Error(w, "invalid token", http.StatusUnauthorized)
            return
        }
        ctx := context.WithValue(r.Context(), "userID", userID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// isPublicEndpoint は認証不要なエンドポイントかどうかを判定します
func isPublicEndpoint(method, path string) bool {
    // ログインとユーザー登録エンドポイントは認証不要
    if method == "POST" && (path == "/users/login" || path == "/users/register") {
        return true
    }
    return false
}
