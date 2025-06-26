package usecase

import (
    "todo-app/internal/project/domain"
    "todo-app/internal/project/repository"
)

type ProjectUseCase struct {
    repo repository.ProjectRepository
}

func NewProjectUseCase(r repository.ProjectRepository) *ProjectUseCase {
    return &ProjectUseCase{repo: r}
}

func (uc *ProjectUseCase) Create(dto *ProjectDTO) (string, error) {
    project := domain.NewProject(dto.ID, dto.Name, dto.Description, dto.StartDate, dto.EndDate, dto.CreatedBy)
    if err := uc.repo.Create(project); err != nil {
        return "", err
    }
    return project.ID, nil
}

func (uc *ProjectUseCase) GetAll() ([]*ProjectDTO, error) {
    projects, err := uc.repo.GetAll()
    if err != nil {
        return nil, err
    }
    
    dtos := make([]*ProjectDTO, len(projects))
    for i, project := range projects {
        dtos[i] = &ProjectDTO{
            ID:          project.ID,
            Name:        project.Name,
            Description: project.Description,
            StartDate:   project.StartDate,
            EndDate:     project.EndDate,
            CreatedBy:   project.CreatedBy,
        }
    }
    return dtos, nil
}

func (uc *ProjectUseCase) GetByID(id string) (*ProjectDTO, error) {
    project, err := uc.repo.GetByID(id)
    if err != nil {
        return nil, err
    }
    
    return &ProjectDTO{
        ID:          project.ID,
        Name:        project.Name,
        Description: project.Description,
        StartDate:   project.StartDate,
        EndDate:     project.EndDate,
        CreatedBy:   project.CreatedBy,
    }, nil
}

func (uc *ProjectUseCase) GetMembers(projectID string) ([]*MemberDTO, error) {
    members, err := uc.repo.GetMembers(projectID)
    if err != nil {
        return nil, err
    }
    
    dtos := make([]*MemberDTO, len(members))
    for i, member := range members {
        dtos[i] = &MemberDTO{
            ID:    member.ID,
            Name:  member.Name,
            Email: member.Email,
        }
    }
    return dtos, nil
}

func (uc *ProjectUseCase) AddMember(projectID, userID string) error {
    return uc.repo.AddMember(projectID, userID)
}
