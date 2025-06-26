package auth

import (
    "errors"
    "time"

    "github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte("your-secret-key")

type Claims struct {
    UserID string `json:"user_id"`
    jwt.RegisteredClaims
}

func GenerateToken(userID string) (string, error) {
    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &Claims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(expirationTime),
        },
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        return "", err
    }
    return tokenString, nil
}

func ValidateToken(tokenStr string) (string, error) {
    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })
    if err != nil || !token.Valid {
        return "", errors.New("invalid token")
    }
    return claims.UserID, nil
}
