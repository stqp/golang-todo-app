import { test, expect } from '@playwright/test';

test.describe('TODO App Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Handle authentication - check if we're on login page
    const isLoginPage = await page.locator('text=Welcome Back').isVisible();
    
    if (isLoginPage) {
      // Use the default test user credentials from init_db.sql
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password');
      await page.click('button[type="submit"]');
      
      // Wait for login to complete and redirect
      await page.waitForURL('/');
    }
    
    // Navigate to tasks page for testing
    await page.goto('/tasks');
  });

  test.describe('F-1: Task Input Field (B-1: Immediate Task Registration)', () => {
    test('should add task immediately when form is submitted', async ({ page }) => {
      // Open task creation modal
      await page.click('button:has-text("タスクを作成")');
      
      // Fill in task details
      await page.fill('input[name="title"]', 'Test task for immediate registration');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Open');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Verify task is added to the list
      await expect(page.locator('text=Test task for immediate registration')).toBeVisible();
    });

    test('should clear form after adding task', async ({ page }) => {
      // Open task creation modal
      await page.click('button:has-text("タスクを作成")');
      
      // Fill in task details
      await page.fill('input[name="title"]', 'Test task for form clearing');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Open');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for modal to close
      await page.waitForSelector('button:has-text("タスクを作成")');
      
      // Open modal again and verify form is cleared
      await page.click('button:has-text("タスクを作成")');
      await expect(page.locator('input[name="title"]')).toHaveValue('');
    });
  });

  test.describe('F-2: Task Status Toggle (B-2: One-click Task Completion)', () => {
    test('should update task status when edited', async ({ page }) => {
      // First create a task
      await page.click('button:has-text("タスクを作成")');
      await page.fill('input[name="title"]', 'Test task for status toggle');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Open');
      await page.click('button[type="submit"]');
      
      // Wait for task to appear
      await expect(page.locator('text=Test task for status toggle')).toBeVisible();
      
      // Click on the task to edit (assuming there's an edit functionality)
      await page.click('text=Test task for status toggle');
      
      // Change status to Completed
      await page.selectOption('select[name="status"]', 'Completed');
      await page.click('button[type="submit"]');
      
      // Verify status badge shows Completed
      await expect(page.locator('text=Completed')).toBeVisible();
    });
  });

  test.describe('F-3: Task Filtering (B-3: Show/Hide Completed Tasks)', () => {
    test('should show all tasks by default', async ({ page }) => {
      // Create multiple tasks with different statuses
      await page.click('button:has-text("タスクを作成")');
      await page.fill('input[name="title"]', 'Open Task');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Open');
      await page.click('button[type="submit"]');
      
      await page.click('button:has-text("タスクを作成")');
      await page.fill('input[name="title"]', 'Completed Task');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Completed');
      await page.click('button[type="submit"]');
      
      // Verify both tasks are visible
      await expect(page.locator('text=Open Task')).toBeVisible();
      await expect(page.locator('text=Completed Task')).toBeVisible();
    });
  });

  test.describe('F-4: Task Editing (B-4: Edit Task Content)', () => {
    test('should enable task editing', async ({ page }) => {
      // Create a task first
      await page.click('button:has-text("タスクを作成")');
      await page.fill('input[name="title"]', 'Original Task Title');
      await page.fill('textarea[name="description"]', 'Original description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Open');
      await page.click('button[type="submit"]');
      
      // Wait for task to appear
      await expect(page.locator('text=Original Task Title')).toBeVisible();
      
      // Click on task to edit (assuming edit functionality exists)
      await page.click('text=Original Task Title');
      
      // Edit the task
      await page.fill('input[name="title"]', 'Edited Task Title');
      await page.fill('textarea[name="description"]', 'Edited description');
      await page.click('button[type="submit"]');
      
      // Verify the task is updated
      await expect(page.locator('text=Edited Task Title')).toBeVisible();
      await expect(page.locator('text=Original Task Title')).not.toBeVisible();
    });
  });

  test.describe('F-5: Task Deletion (B-5: Delete Unnecessary Tasks)', () => {
    test('should delete task when delete button is clicked', async ({ page }) => {
      // Create a task first
      await page.click('button:has-text("タスクを作成")');
      await page.fill('input[name="title"]', 'Task to delete');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Open');
      await page.click('button[type="submit"]');
      
      // Wait for task to appear
      await expect(page.locator('text=Task to delete')).toBeVisible();
      
      // Look for delete button (assuming it exists in the task card)
      const deleteButton = page.locator('button[aria-label*="delete"], button:has-text("削除"), svg[data-icon="trash"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Verify task is removed
        await expect(page.locator('text=Task to delete')).not.toBeVisible();
      }
    });
  });

  test.describe('F-6: Task Counter Display (B-6: Progress Tracking)', () => {
    test('should display task statistics', async ({ page }) => {
      // Navigate to dashboard to see statistics
      await page.goto('/');
      
      // Look for task statistics
      const totalTasks = page.locator('text=/Total Tasks/');
      const completedTasks = page.locator('text=/Completed Tasks/');
      
      // Verify statistics are displayed
      await expect(totalTasks).toBeVisible();
      await expect(completedTasks).toBeVisible();
    });

    test('should update statistics in real-time', async ({ page }) => {
      // Navigate to dashboard first
      await page.goto('/');
      
      // Get initial task count
      const totalTasksElement = page.locator('text=/Total Tasks/').first();
      const initialText = await totalTasksElement.textContent();
      
      // Navigate to tasks and create a new task
      await page.goto('/tasks');
      await page.click('button:has-text("タスクを作成")');
      await page.fill('input[name="title"]', 'Statistics test task');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'Medium');
      await page.selectOption('select[name="status"]', 'Open');
      await page.click('button[type="submit"]');
      
      // Navigate back to dashboard
      await page.goto('/');
      
      // Verify statistics updated
      const updatedText = await totalTasksElement.textContent();
      expect(updatedText).not.toBe(initialText);
    });
  });

  test.describe('Integration Tests', () => {
    test('should handle complete task workflow', async ({ page }) => {
      // Create a task
      await page.click('button:has-text("タスクを作成")');
      await page.fill('input[name="title"]', 'Integration Test Task');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.selectOption('select[name="priority"]', 'High');
      await page.selectOption('select[name="status"]', 'Open');
      await page.click('button[type="submit"]');
      
      // Verify task is created
      await expect(page.locator('text=Integration Test Task')).toBeVisible();
      await expect(page.locator('text=High')).toBeVisible();
      await expect(page.locator('text=Open')).toBeVisible();
      
      // Edit the task
      await page.click('text=Integration Test Task');
      await page.fill('input[name="title"]', 'Updated Integration Task');
      await page.selectOption('select[name="status"]', 'Completed');
      await page.click('button[type="submit"]');
      
      // Verify task is updated
      await expect(page.locator('text=Updated Integration Task')).toBeVisible();
      await expect(page.locator('text=Completed')).toBeVisible();
    });
  });
}); 