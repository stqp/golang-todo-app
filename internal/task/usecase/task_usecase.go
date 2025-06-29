package usecase

import (
	"fmt"
	"todo-app/internal/task/domain"
	"todo-app/internal/task/repository"
	"todo-app/internal/infrastructure"

	"github.com/google/uuid"
)

var solrClient, _ = infrastructure.NewSolrClient("todoapp")

type TaskUseCase struct {
	taskRepo    repository.TaskRepository
	subtaskRepo repository.SubtaskRepository
}

func NewTaskUseCase(tr repository.TaskRepository, sr repository.SubtaskRepository) *TaskUseCase {
	return &TaskUseCase{taskRepo: tr, subtaskRepo: sr}
}

func (uc *TaskUseCase) CreateTask(dto *TaskDTO) (string, error) {
	// Use provided ID if it exists, otherwise generate a new UUID
	if dto.ID == "" {
		dto.ID = uuid.New().String()
		fmt.Printf("Generated new UUID: %s\n", dto.ID)
	} else {
		fmt.Printf("Using provided ID: %s\n", dto.ID)
	}
	task := domain.NewTask(dto.ID, dto.Title, dto.Description, dto.ProjectID, dto.AssigneeID, dto.DueDate, dto.Priority, dto.Status, dto.CreatedBy)
	fmt.Printf("Created task with ID: %s\n", task.ID)
	if err := uc.taskRepo.Create(task); err != nil {
		fmt.Printf("Error creating task: %v\n", err)
		return "", err
	}
	// Solrにも投入
	solrClient.Add(map[string]interface{}{
		"id":        task.ID,
		"type":      "task",
		"title":     task.Title,
		"description": task.Description,
	})
	return task.ID, nil
}

func (uc *TaskUseCase) GetAllTasks() ([]*TaskDTO, error) {
	tasks, err := uc.taskRepo.GetAll()
	if err != nil {
		return nil, err
	}

	dtos := make([]*TaskDTO, len(tasks))
	for i, task := range tasks {
		dtos[i] = &TaskDTO{
			ID:          task.ID,
			Title:       task.Title,
			Description: task.Description,
			ProjectID:   task.ProjectID,
			AssigneeID:  task.AssigneeID,
			DueDate:     task.DueDate,
			Priority:    task.Priority,
			Status:      task.Status,
			CreatedBy:   task.CreatedBy,
		}
	}
	return dtos, nil
}

func (uc *TaskUseCase) GetTasksByProject(projectID string) ([]*TaskDTO, error) {
	tasks, err := uc.taskRepo.ListByProject(projectID)
	if err != nil {
		return nil, err
	}

	dtos := make([]*TaskDTO, len(tasks))
	for i, task := range tasks {
		dtos[i] = &TaskDTO{
			ID:          task.ID,
			Title:       task.Title,
			Description: task.Description,
			ProjectID:   task.ProjectID,
			AssigneeID:  task.AssigneeID,
			DueDate:     task.DueDate,
			Priority:    task.Priority,
			Status:      task.Status,
			CreatedBy:   task.CreatedBy,
		}
	}
	return dtos, nil
}

func (uc *TaskUseCase) GetTaskByID(id string) (*TaskDTO, error) {
	task, err := uc.taskRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	return &TaskDTO{
		ID:          task.ID,
		Title:       task.Title,
		Description: task.Description,
		ProjectID:   task.ProjectID,
		AssigneeID:  task.AssigneeID,
		DueDate:     task.DueDate,
		Priority:    task.Priority,
		Status:      task.Status,
		CreatedBy:   task.CreatedBy,
	}, nil
}

func (uc *TaskUseCase) CreateSubtask(dto *SubtaskDTO) (string, error) {
	// Always generate a new UUID for the subtask
	dto.ID = uuid.New().String()
	subtask := domain.NewSubtask(dto.ID, dto.Title, dto.TaskID)
	if err := uc.subtaskRepo.Create(subtask); err != nil {
		return "", err
	}
	return subtask.ID, nil
}

func (uc *TaskUseCase) DeleteTask(id string) error {
	// First check if task exists
	_, err := uc.taskRepo.GetByID(id)
	if err != nil {
		return err
	}

	// Delete the task
	return uc.taskRepo.Delete(id)
}
