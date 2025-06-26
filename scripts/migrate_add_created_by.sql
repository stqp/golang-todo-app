-- マイグレーション: created_byカラムの追加

-- プロジェクトテーブルにcreated_byカラムを追加
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL;

-- タスクテーブルにcreated_byカラムを追加
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL;

-- 既存のプロジェクトのcreated_byを更新（テストプロジェクトの場合）
UPDATE projects SET created_by = 'test-user-1' WHERE id = 'test-project-1' AND created_by IS NULL; 