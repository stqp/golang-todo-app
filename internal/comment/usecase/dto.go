package usecase

type CommentDTO struct {
    ID       string `json:"id"`
    Content  string `json:"content"`
    TaskID   string `json:"task_id"`
    AuthorID string `json:"author_id"`
}
