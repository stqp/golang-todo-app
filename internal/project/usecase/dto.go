package usecase

import (
    "encoding/json"
    "time"
)

type ProjectDTO struct {
    ID          string    `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    StartDate   time.Time `json:"start_date"`
    EndDate     time.Time `json:"end_date"`
    CreatedBy   string    `json:"created_by"`
}

type MemberDTO struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

// UnmarshalJSON implements custom JSON unmarshaling for ProjectDTO
func (p *ProjectDTO) UnmarshalJSON(data []byte) error {
    type Alias ProjectDTO
    aux := &struct {
        StartDate string `json:"start_date"`
        EndDate   string `json:"end_date"`
        *Alias
    }{
        Alias: (*Alias)(p),
    }
    
    if err := json.Unmarshal(data, &aux); err != nil {
        return err
    }
    
    // Parse date fields from various formats
    formats := []string{
        "2006-01-02T15:04:05Z07:00", // RFC3339
        "2006-01-02T15:04:05",       // ISO without timezone
        "2006-01-02",                // Date only
        "2006-01-02 15:04:05",       // MySQL format
    }
    
    // Parse StartDate
    if aux.StartDate != "" {
        var parsed bool
        for _, format := range formats {
            if parsedTime, err := time.Parse(format, aux.StartDate); err == nil {
                p.StartDate = parsedTime
                parsed = true
                break
            }
        }
        if !parsed {
            return json.Unmarshal(data, &struct {
                StartDate time.Time `json:"start_date"`
                *Alias
            }{
                Alias: (*Alias)(p),
            })
        }
    }
    
    // Parse EndDate
    if aux.EndDate != "" {
        var parsed bool
        for _, format := range formats {
            if parsedTime, err := time.Parse(format, aux.EndDate); err == nil {
                p.EndDate = parsedTime
                parsed = true
                break
            }
        }
        if !parsed {
            return json.Unmarshal(data, &struct {
                EndDate time.Time `json:"end_date"`
                *Alias
            }{
                Alias: (*Alias)(p),
            })
        }
    }
    
    return nil
}
