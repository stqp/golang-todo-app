package usecase

type UserDTO struct {
    ID       string `json:"id"`
    Name     string `json:"name"`
    Email    string `json:"email"`
    Password string `json:"password"`
    Role     string `json:"role"`
    Timezone string `json:"timezone"`
    Language string `json:"language"`
}
