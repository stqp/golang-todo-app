# TODO Application

このアプリケーションは、プロジェクトとタスクを管理するためのTODOアプリケーションです。
バックエンドはGo言語で実装され、フロントエンドはReact + TypeScriptで実装されています。

## 機能概要

- ユーザー管理（登録、ログイン、認証）
- プロジェクト管理
  - プロジェクトの作成・閲覧
  - プロジェクトメンバーの管理
- タスク管理
  - タスクの作成・編集
  - サブタスクの追加・完了管理
  - タスクへのコメント機能
- モダンなUI/UX
  - レスポンシブデザイン
  - ダークモード対応
  - リアルタイムの状態更新

## ローカルでの実行方法

### 1. データベースの自動セットアップ（Docker Compose）

#### 前提条件
- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること

#### Linux/macOS
```bash
# スクリプトに実行権限を付与
chmod +x scripts/setup_db.sh

# データベースの初期化を実行
./scripts/setup_db.sh
```

#### Windows
```powershell
# PowerShellでスクリプトを実行
.\scripts\setup_db.ps1
```

#### 手動でDocker Composeを実行
```bash
# データベースコンテナを起動
docker-compose up -d postgres

# データベースの準備完了を待つ（約30秒）
# その後、初期化スクリプトを実行
docker-compose exec postgres psql -U todo_user -d todoapp -f /docker-entrypoint-initdb.d/init_db.sql
```

### 2. バックエンド（Go）

1. 必要な環境
   - Go 1.21以上
   - Docker Desktop（データベース用）

2. アプリケーションの実行
   ```bash
   # プロジェクトのルートディレクトリで実行
   cd cmd/todo-api
   go run main.go
   ```

バックエンドサーバーは `http://localhost:8080` で起動します。

### 3. フロントエンド（React + TypeScript）

1. 必要な環境
   - Node.js 18以上
   - npm 9以上

2. 依存関係のインストールと開発サーバーの起動
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

フロントエンドの開発サーバーは `http://localhost:5173` で起動します。

## テストアカウント

自動セットアップスクリプトを実行すると、以下のテストアカウントが作成されます：

- メールアドレス: `test@example.com`
- パスワード: `password`

## アプリケーションの使い方

1. ユーザー登録とログイン
   - `/register` にアクセスして新規ユーザー登録
   - `/login` にアクセスしてログイン
   - または、上記のテストアカウントを使用

2. プロジェクト管理
   - ダッシュボードでプロジェクト一覧を表示
   - 「Create Project」ボタンで新規プロジェクト作成
   - プロジェクトカードをクリックして詳細表示
   - プロジェクト詳細画面でメンバーを追加可能

3. タスク管理
   - プロジェクト詳細画面で「Create Task」ボタンからタスク作成
   - タスクカードをクリックして詳細表示
   - タスク詳細画面で以下の操作が可能：
     - ステータス変更（Open, In Progress, Done, Canceled）
     - サブタスクの追加と完了管理
     - コメントの追加

4. その他の機能
   - 右上のアイコンでダークモード切り替え
   - レスポンシブデザインでモバイル対応
   - リアルタイムの状態更新とエラー通知

## データベース管理

### Docker Composeコマンド

```bash
# データベースの起動
docker-compose up -d postgres

# データベースの停止
docker-compose down

# データベースの状態確認
docker-compose ps

# データベースのログ確認
docker-compose logs postgres

# データベースの再起動
docker-compose restart postgres

# データベースとボリュームを完全削除
docker-compose down -v
```

### 自動化スクリプトの追加コマンド

```bash
# Linux/macOS
./scripts/setup_db.sh status    # 状態確認
./scripts/setup_db.sh stop      # 停止
./scripts/setup_db.sh restart   # 再起動

# Windows
.\scripts\setup_db.ps1 status   # 状態確認
.\scripts\setup_db.ps1 stop     # 停止
.\scripts\setup_db.ps1 restart  # 再起動
```

## 手動セットアップ（詳細）

### Docker Desktopのインストール

#### Windows/macOS
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)からダウンロード
2. インストーラーを実行し、指示に従ってインストール

#### Ubuntu
```bash
# Dockerのインストール
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# ユーザーをdockerグループに追加
sudo usermod -aG docker $USER
# ログアウト・ログインが必要
```

### 環境変数の設定

自動セットアップスクリプトが `.env` ファイルを作成しますが、手動で設定する場合は以下の内容でファイルを作成してください：

```bash
# Database Configuration (Docker Compose)
DB_HOST=localhost
DB_PORT=5432
DB_USER=todo_user
DB_PASSWORD=todo_pass
DB_NAME=todoapp
DB_DSN=postgres://todo_user:todo_pass@localhost:5432/todoapp?sslmode=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=8080
```

## 技術スタック

### バックエンド
- 言語：Go
- フレームワーク：Chi
- データベース：PostgreSQL（Docker）
- 認証：JWT

### フロントエンド
- 言語：TypeScript
- フレームワーク：React
- UIライブラリ：Chakra UI
- 状態管理：React Query
- フォーム：Formik + Yup
- ビルドツール：Vite

### インフラ
- コンテナ化：Docker
- オーケストレーション：Docker Compose
- データベース：PostgreSQL 15

## トラブルシューティング

### よくある問題

1. **Dockerが起動していない**
   ```bash
   # Docker Desktopを起動
   # または、Linuxの場合
   sudo systemctl start docker
   ```

2. **ポートが使用中**
   - バックエンド：8080番ポートが使用されていないか確認
   - フロントエンド：5173番ポートが使用されていないか確認
   - データベース：5432番ポートが使用されていないか確認

3. **データベース接続エラー**
   ```bash
   # データベースコンテナの状態確認
   docker-compose ps
   
   # データベースのログ確認
   docker-compose logs postgres
   
   # データベースの再起動
   docker-compose restart postgres
   ```

4. **フロントエンドの依存関係エラー**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **データベースの初期化が失敗**
   ```bash
   # コンテナとボリュームを削除して再作成
   docker-compose down -v
   docker-compose up -d postgres
   
   # 初期化スクリプトを手動実行
   docker-compose exec postgres psql -U todo_user -d todoapp -f /docker-entrypoint-initdb.d/init_db.sql
   ```

### データベースのバックアップとリストア

```bash
# バックアップ
docker-compose exec postgres pg_dump -U todo_user todoapp > backup.sql

# リストア
docker-compose exec -T postgres psql -U todo_user -d todoapp < backup.sql
```