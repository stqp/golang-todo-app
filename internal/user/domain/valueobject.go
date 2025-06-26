package domain

import (
    "errors"
    "regexp"
    "golang.org/x/crypto/bcrypt"
)

func ValidateEmail(email string) error {
    re := regexp.MustCompile(`^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$`)
    if !re.MatchString(email) {
        return errors.New("invalid email format")
    }
    return nil
}

func HashPassword(password string) (string, error) {
    hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", err
    }
    return string(hashedBytes), nil
}

func CheckPassword(hash, password string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
