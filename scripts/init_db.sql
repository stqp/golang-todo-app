-- データベースの初期化スクリプト

-- ユーザーテーブルの作成
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    timezone VARCHAR(100) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- プロジェクトテーブルの作成
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- プロジェクトメンバーテーブルの作成
CREATE TABLE IF NOT EXISTS project_members (
    project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

-- タスクテーブルの作成
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Open',
    project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サブタスクテーブルの作成
CREATE TABLE IF NOT EXISTS subtasks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- コメントテーブルの作成
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT NOT NULL,
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知テーブルの作成
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    related_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テスト用ユーザーの作成
INSERT INTO users (id, name, email, password_hash, role, timezone, language) 
VALUES (
    'test-user-1',
    'Test User',
    'test@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'user',
    'Asia/Tokyo',
    'en'
) ON CONFLICT (id) DO NOTHING;

-- テスト用プロジェクトの作成
INSERT INTO projects (id, name, description, start_date, end_date, created_by)
VALUES (
    'test-project-1',
    'Sample Project',
    'This is a sample project for testing',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'test-user-1'
) ON CONFLICT (id) DO NOTHING;

-- プロジェクトメンバーの追加
INSERT INTO project_members (project_id, user_id)
VALUES ('test-project-1', 'test-user-1')
ON CONFLICT (project_id, user_id) DO NOTHING; 