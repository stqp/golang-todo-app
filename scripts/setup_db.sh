#!/bin/bash

# データベース初期化スクリプト（Docker Compose版）
# このスクリプトはDocker Composeを使用してPostgreSQLを起動し、データベースを初期化します

set -e  # エラーが発生したらスクリプトを停止

# 色付きの出力用関数
print_info() {
    echo -e "\033[34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

# Dockerがインストールされているかチェック
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_info "Installation guide: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

# Docker Composeがインストールされているかチェック
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_info "Installation guide: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Docker Composeコマンドの決定
get_docker_compose_cmd() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    else
        echo "docker compose"
    fi
}

# PostgreSQLコンテナの起動
start_postgres() {
    print_info "Starting PostgreSQL with Docker Compose..."
    
    local compose_cmd=$(get_docker_compose_cmd)
    
    # 既存のコンテナを停止・削除
    $compose_cmd down -v 2>/dev/null || true
    
    # コンテナを起動
    $compose_cmd up -d postgres
    
    print_success "PostgreSQL container started"
}

# データベースの準備完了を待機
wait_for_database() {
    print_info "Waiting for database to be ready..."
    
    local compose_cmd=$(get_docker_compose_cmd)
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if $compose_cmd exec -T postgres pg_isready -U todo_user -d todoapp >/dev/null 2>&1; then
            print_success "Database is ready"
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts: Database not ready yet, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Database failed to become ready within the expected time"
    return 1
}

# データベースの初期化確認
check_database_initialization() {
    print_info "Checking database initialization..."
    
    local compose_cmd=$(get_docker_compose_cmd)
    
    # テスト用ユーザーが存在するかチェック
    local user_exists=$($compose_cmd exec -T postgres psql -U todo_user -d todoapp -t -c "SELECT COUNT(*) FROM users WHERE email = 'test@example.com';" 2>/dev/null | tr -d ' ')
    
    if [ "$user_exists" = "1" ]; then
        print_success "Database is already initialized"
        return 0
    else
        print_warning "Database needs initialization"
        return 1
    fi
}

# データベースの初期化
initialize_database() {
    print_info "Initializing database..."
    
    local compose_cmd=$(get_docker_compose_cmd)
    
    # 初期化スクリプトを実行
    $compose_cmd exec -T postgres psql -U todo_user -d todoapp -f /docker-entrypoint-initdb.d/init_db.sql
    
    print_success "Database initialized successfully"
}

# 接続テスト
test_connection() {
    print_info "Testing database connection..."
    
    local compose_cmd=$(get_docker_compose_cmd)
    
    if $compose_cmd exec -T postgres psql -U todo_user -d todoapp -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection test passed"
        return 0
    else
        print_error "Database connection test failed"
        return 1
    fi
}

# 環境変数の設定
setup_environment() {
    print_info "Setting up environment variables..."
    
    # .envファイルを作成
    cat > .env << EOF
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
EOF
    
    print_success "Environment variables configured"
    print_info "Environment file created: .env"
}

# データベースの停止
stop_database() {
    print_info "Stopping PostgreSQL container..."
    
    local compose_cmd=$(get_docker_compose_cmd)
    $compose_cmd down
    
    print_success "PostgreSQL container stopped"
}

# データベースの状態表示
show_status() {
    local compose_cmd=$(get_docker_compose_cmd)
    
    print_info "Database status:"
    $compose_cmd ps
    
    print_info ""
    print_info "Container logs:"
    $compose_cmd logs postgres --tail=10
}

# メイン処理
main() {
    print_info "Starting database setup with Docker Compose..."
    
    # 各ステップを実行
    check_docker
    check_docker_compose
    start_postgres
    wait_for_database
    
    if check_database_initialization; then
        print_info "Database is already initialized"
    else
        initialize_database
    fi
    
    if test_connection; then
        setup_environment
        
        print_success "Database setup completed successfully!"
        print_info ""
        print_info "Test account credentials:"
        print_info "  Email: test@example.com"
        print_info "  Password: password"
        print_info ""
        print_info "To start the backend server:"
        print_info "  cd cmd/todo-api"
        print_info "  go run main.go"
        print_info ""
        print_info "To start the frontend server:"
        print_info "  cd frontend"
        print_info "  npm run dev"
        print_info ""
        print_info "To stop the database:"
        print_info "  docker-compose down"
        print_info ""
        print_info "To view database logs:"
        print_info "  docker-compose logs postgres"
    else
        print_error "Setup failed"
        exit 1
    fi
}

# コマンドライン引数の処理
case "${1:-}" in
    "stop")
        stop_database
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_database
        main
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        print_info "Usage: $0 [stop|status|restart]"
        exit 1
        ;;
esac 