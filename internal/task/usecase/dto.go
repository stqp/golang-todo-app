package usecase

import (
    "encoding/json"
    "time"
)

type TaskDTO struct {
    ID          string    `json:"id"`
    Title       string    `json:"title"`
    Description string    `json:"description"`
    DueDate     time.Time `json:"due_date"`
    Priority    string    `json:"priority"`
    Status      string    `json:"status"`
    ProjectID   string    `json:"project_id"`
    AssigneeID  string    `json:"assignee_id"`
    CreatedBy   string    `json:"created_by"`
}

// UnmarshalJSON implements custom JSON unmarshaling for TaskDTO
func (t *TaskDTO) UnmarshalJSON(data []byte) error {
    type Alias TaskDTO
    aux := &struct {
        DueDate string `json:"due_date"`
        *Alias
    }{
        Alias: (*Alias)(t),
    }
    
    if err := json.Unmarshal(data, &aux); err != nil {
        return err
    }
    
    // Parse due_date from various formats
    if aux.DueDate != "" {
        // Try different date formats
        formats := []string{
            "2006-01-02T15:04:05Z07:00", // RFC3339
            "2006-01-02T15:04:05",       // ISO without timezone
            "2006-01-02",                // Date only
            "2006-01-02 15:04:05",       // MySQL format
        }
        
        var parsed bool
        for _, format := range formats {
            if parsedTime, err := time.Parse(format, aux.DueDate); err == nil {
                t.DueDate = parsedTime
                parsed = true
                break
            }
        }
        
        if !parsed {
            return json.Unmarshal(data, &struct {
                DueDate time.Time `json:"due_date"`
                *Alias
            }{
                Alias: (*Alias)(t),
            })
        }
    }
    
    return nil
}

type SubtaskDTO struct {
    ID     string `json:"id"`
    Title  string `json:"title"`
    TaskID string `json:"task_id"`
}
