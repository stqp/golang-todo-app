package usecase

import (
    "todo-app/internal/task/domain"
    "todo-app/internal/task/repository"
)

type TaskUseCase struct {
    taskRepo    repository.TaskRepository
    subtaskRepo repository.SubtaskRepository
}

func NewTaskUseCase(tr repository.TaskRepository, sr repository.SubtaskRepository) *TaskUseCase {
    return &TaskUseCase{taskRepo: tr, subtaskRepo: sr}
}

func (uc *TaskUseCase) CreateTask(dto *TaskDTO) (string, error) {
    task := domain.NewTask(dto.ID, dto.Title, dto.Description, dto.ProjectID, dto.AssigneeID, dto.DueDate, dto.Priority, dto.Status, dto.CreatedBy)
    if err := uc.taskRepo.Create(task); err != nil {
        return "", err
    }
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
    subtask := domain.NewSubtask(dto.ID, dto.Title, dto.TaskID)
    if err := uc.subtaskRepo.Create(subtask); err != nil {
        return "", err
    }
    return subtask.ID, nil
}
