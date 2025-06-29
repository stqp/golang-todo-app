export interface User {
  id: string;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'InProgress' | 'Done' | 'Canceled';
  created_at: string;
  updated_at: string;
  project_id: string;
  assignee_id: string;
}

export interface Subtask {
  id: string;
  title: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
  task_id: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  task_id: string;
  user_id: string;
}

export interface Notification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  related_id: string;
} 