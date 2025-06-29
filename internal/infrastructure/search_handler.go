package infrastructure

import (
	"encoding/json"
	"net/http"
	"github.com/go-chi/chi/v5"
)

func RegisterSearchRoutes(r chi.Router) {
	r.Get("/search", SearchHandler)
}

func SearchHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if query == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"query required"}`))
		return
	}
	client, _ := NewSolrClient("todoapp")
	results, err := client.Search(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error":"search failed"}`))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
} 