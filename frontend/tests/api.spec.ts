import { test, expect } from '@playwright/test';

test.describe('TODO API Tests', () => {
  const baseURL = 'http://localhost:8080';
  let authToken: string;
  const testProjectId = 'test-project-1'; // From init_db.sql

  test.beforeAll(async ({ request }) => {
    // Login with the default test user credentials from init_db.sql
    const loginResponse = await request.post(`${baseURL}/users/login`, {
      data: {
        email: 'test@example.com',
        password: 'password'
      }
    });

    if (loginResponse.status() === 200) {
      const result = await loginResponse.json();
      // The backend returns just the token string, not an object
      authToken = result.token || result;
    } else {
      console.error('Failed to login with test user:', await loginResponse.text());
    }
  });

  test.describe('Task Management API', () => {
    test('should create a new task', async ({ request }) => {
      const response = await request.post(`${baseURL}/tasks`, {
        data: {
          id: `task-${Date.now()}-1`,
          title: 'Test API Task',
          description: 'Test task created via API',
          priority: 'Medium',
          status: 'Open',
          due_date: new Date().toISOString().split('T')[0],
          project_id: testProjectId
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(201);
      const result = await response.json();
      expect(result.id).toBeDefined();
    });

    test('should get all tasks', async ({ request }) => {
      const response = await request.get(`${baseURL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const tasks = await response.json();
      expect(Array.isArray(tasks)).toBe(true);
    });

    test('should get task by ID', async ({ request }) => {
      // First create a task
      const taskId = `task-${Date.now()}-2`;
      const createResponse = await request.post(`${baseURL}/tasks`, {
        data: {
          id: taskId,
          title: 'Task for Get Test',
          description: 'Test task for get by ID',
          priority: 'Medium',
          status: 'Open',
          due_date: new Date().toISOString().split('T')[0],
          project_id: testProjectId
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const createdTask = await createResponse.json();
      expect(createdTask.id).toBe(taskId);

      // Get the task by ID
      const getResponse = await request.get(`${baseURL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(getResponse.status()).toBe(200);
      const task = await getResponse.json();
      expect(task.id).toBe(taskId);
      expect(task.title).toBe('Task for Get Test');
    });

    test('should delete a task', async ({ request }) => {
      // First create a task
      const taskId = `task-${Date.now()}-3`;
      await request.post(`${baseURL}/tasks`, {
        data: {
          id: taskId,
          title: 'Task for Delete Test',
          description: 'Test task for deletion',
          priority: 'Medium',
          status: 'Open',
          due_date: new Date().toISOString().split('T')[0],
          project_id: testProjectId
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Delete the task
      const deleteResponse = await request.delete(`${baseURL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(deleteResponse.status()).toBe(200);
      const result = await deleteResponse.json();
      expect(result.message).toBe('task deleted successfully');

      // Verify task is deleted
      const getResponse = await request.get(`${baseURL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('Project Management API', () => {
    test('should create a new project', async ({ request }) => {
      const response = await request.post(`${baseURL}/projects`, {
        data: {
          id: `project-${Date.now()}-1`,
          name: 'Test Project',
          description: 'Test project created via API'
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(201);
      const result = await response.json();
      expect(result.id).toBeDefined();
    });

    test('should get all projects', async ({ request }) => {
      const response = await request.get(`${baseURL}/projects`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(response.status()).toBe(200);
      const projects = await response.json();
      expect(Array.isArray(projects)).toBe(true);
    });

    test('should get project by ID', async ({ request }) => {
      // First create a project
      const projectId = `project-${Date.now()}-2`;
      const createResponse = await request.post(`${baseURL}/projects`, {
        data: {
          id: projectId,
          name: 'Project for Get Test',
          description: 'Test project for get by ID'
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const createdProject = await createResponse.json();
      expect(createdProject.id).toBe(projectId);

      // Get the project by ID
      const getResponse = await request.get(`${baseURL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(getResponse.status()).toBe(200);
      const project = await getResponse.json();
      expect(project.id).toBe(projectId);
      expect(project.name).toBe('Project for Get Test');
    });

    test('should delete a project', async ({ request }) => {
      // First create a project
      const projectId = `project-${Date.now()}-3`;
      await request.post(`${baseURL}/projects`, {
        data: {
          id: projectId,
          name: 'Project for Delete Test',
          description: 'Test project for deletion'
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Delete the project
      const deleteResponse = await request.delete(`${baseURL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(deleteResponse.status()).toBe(200);
      const result = await deleteResponse.json();
      expect(result.message).toBe('project deleted successfully');

      // Verify project is deleted
      const getResponse = await request.get(`${baseURL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('User Management API', () => {
    test('should register a new user', async ({ request }) => {
      const response = await request.post(`${baseURL}/users/register`, {
        data: {
          id: `user-${Date.now()}-1`,
          username: 'newtestuser',
          email: 'newtest@example.com',
          password: 'password123'
        }
      });

      expect(response.status()).toBe(201);
      const user = await response.json();
      expect(user.id).toBeDefined();
    });

    test('should login user', async ({ request }) => {
      // First register a user
      const userId = `user-${Date.now()}-2`;
      await request.post(`${baseURL}/users/register`, {
        data: {
          id: userId,
          username: 'logintestuser',
          email: 'logintest@example.com',
          password: 'password123'
        }
      });

      // Login
      const response = await request.post(`${baseURL}/users/login`, {
        data: {
          email: 'logintest@example.com',
          password: 'password123'
        }
      });

      expect(response.status()).toBe(200);
      const result = await response.json();
      expect(result.token || result).toBeDefined();
    });
  });

  test.describe('Error Handling', () => {
    test('should return 404 for non-existent task', async ({ request }) => {
      const response = await request.get(`${baseURL}/tasks/non-existent-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      expect(response.status()).toBe(404);
    });

    test('should return 401 for unauthorized requests', async ({ request }) => {
      const response = await request.get(`${baseURL}/tasks`);
      expect(response.status()).toBe(401);
    });
  });
}); 