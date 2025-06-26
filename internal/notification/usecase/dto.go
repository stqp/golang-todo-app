package usecase

type NotificationDTO struct {
    ID      string `json:"id"`
    Type    string `json:"type"`
    Message string `json:"message"`
    UserID  string `json:"user_id"`
}
