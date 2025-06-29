package main

import (
	"fmt"
	"log"
	"os"
	"todo-app/internal/infrastructure"
	projpg "todo-app/internal/project/repository/postgres"
	taskpg "todo-app/internal/task/repository/postgres"
	"todo-app/internal/infrastructure/db"
)

func main() {
	// DB接続
	dbConn, err := db.InitializePostgres()
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer dbConn.Close()

	solr, _ := infrastructure.NewSolrClient("todoapp")

	// プロジェクト同期
	projRepo := projpg.NewProjectRepoPg(dbConn)
	projects, _ := projRepo.GetAll()
	for _, p := range projects {
		doc := map[string]interface{}{
			"id": p.ID,
			"type": "project",
			"title": p.Name,
			"description": p.Description,
		}
		err := solr.Add(doc)
		if err != nil {
			fmt.Fprintf(os.Stderr, "project sync error: %v\n", err)
		}
	}

	// タスク同期
	taskRepo := taskpg.NewTaskRepoPg(dbConn)
	tasks, _ := taskRepo.GetAll()
	for _, t := range tasks {
		doc := map[string]interface{}{
			"id": t.ID,
			"type": "task",
			"title": t.Title,
			"description": t.Description,
		}
		err := solr.Add(doc)
		if err != nil {
			fmt.Fprintf(os.Stderr, "task sync error: %v\n", err)
		}
	}

	fmt.Println("同期完了")
} 