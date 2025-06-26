package utils

import (
    "net/http"
    "encoding/json"
)

func JSONResponse(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

// DecodeJSON はリクエストボディを指定の構造体にデコードします
func DecodeJSON(r *http.Request, dst interface{}) error {
    defer r.Body.Close()
    decoder := json.NewDecoder(r.Body)
    return decoder.Decode(dst)
}
