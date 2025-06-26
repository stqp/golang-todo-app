# Windows用データベース初期化スクリプト（Docker Compose版）
# このスクリプトはDocker Composeを使用してPostgreSQLを起動し、データベースを初期化します

param(
    [switch]$Force,
    [Parameter(Position=0)]
    [ValidateSet("", "stop", "status", "restart")]
    [string]$Command = ""
)

# 色付きの出力用関数
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Dockerがインストールされているかチェック
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        Write-Success "Docker is installed"
        return $true
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker first."
        Write-Info "Download from: https://docs.docker.com/get-docker/"
        return $false
    }
}

# Docker Composeがインストールされているかチェック
function Test-DockerCompose {
    try {
        $null = Get-Command docker-compose -ErrorAction Stop
        Write-Success "Docker Compose is installed"
        return $true
    }
    catch {
        try {
            docker compose version | Out-Null
            Write-Success "Docker Compose is available"
            return $true
        }
        catch {
            Write-Error "Docker Compose is not installed. Please install Docker Compose first."
            Write-Info "Download from: https://docs.docker.com/compose/install/"
            return $false
        }
    }
}

# Docker Composeコマンドの決定
function Get-DockerComposeCmd {
    try {
        $null = Get-Command docker-compose -ErrorAction Stop
        return "docker-compose"
    }
    catch {
        return "docker compose"
    }
}

# PostgreSQLコンテナの起動
function Start-Postgres {
    Write-Info "Starting PostgreSQL with Docker Compose..."
    
    $composeCmd = Get-DockerComposeCmd
    
    try {
        # 既存のコンテナを停止・削除
        & $composeCmd down -v 2>$null
        
        # コンテナを起動
        & $composeCmd up -d postgres
        
        Write-Success "PostgreSQL container started"
    }
    catch {
        Write-Error "Failed to start PostgreSQL container"
        throw
    }
}

# データベースの準備完了を待機
function Wait-ForDatabase {
    Write-Info "Waiting for database to be ready..."
    
    $composeCmd = Get-DockerComposeCmd
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        try {
            & $composeCmd exec -T postgres pg_isready -U todo_user -d todoapp 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database is ready"
                return $true
            }
        }
        catch {
            # エラーを無視して続行
        }
        
        Write-Info "Attempt $attempt/$maxAttempts : Database not ready yet, waiting..."
        Start-Sleep -Seconds 2
        $attempt++
    }
    
    Write-Error "Database failed to become ready within the expected time"
    return $false
}

# データベースの初期化確認
function Test-DatabaseInitialization {
    Write-Info "Checking database initialization..."
    
    $composeCmd = Get-DockerComposeCmd
    
    try {
        $result = & $composeCmd exec -T postgres psql -U todo_user -d todoapp -t -c "SELECT COUNT(*) FROM users WHERE email = 'test@example.com';" 2>$null
        $userCount = ($result -replace '\s+', '').Trim()
        
        if ($userCount -eq "1") {
            Write-Success "Database is already initialized"
            return $true
        }
        else {
            Write-Warning "Database needs initialization"
            return $false
        }
    }
    catch {
        Write-Warning "Could not check database initialization"
        return $false
    }
}

# データベースの初期化
function Initialize-Database {
    Write-Info "Initializing database..."
    
    $composeCmd = Get-DockerComposeCmd
    
    try {
        & $composeCmd exec -T postgres psql -U todo_user -d todoapp -f /docker-entrypoint-initdb.d/init_db.sql
        Write-Success "Database initialized successfully"
    }
    catch {
        Write-Error "Failed to initialize database"
        throw
    }
}

# 接続テスト
function Test-DatabaseConnection {
    Write-Info "Testing database connection..."
    
    $composeCmd = Get-DockerComposeCmd
    
    try {
        & $composeCmd exec -T postgres psql -U todo_user -d todoapp -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection test passed"
            return $true
        }
        else {
            Write-Error "Database connection test failed"
            return $false
        }
    }
    catch {
        Write-Error "Database connection test failed"
        return $false
    }
}

# 環境変数の設定
function Set-Environment {
    Write-Info "Setting up environment variables..."
    
    $envContent = @"
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
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success "Environment variables configured"
    Write-Info "Environment file created: .env"
}

# データベースの停止
function Stop-Database {
    Write-Info "Stopping PostgreSQL container..."
    
    $composeCmd = Get-DockerComposeCmd
    
    try {
        & $composeCmd down
        Write-Success "PostgreSQL container stopped"
    }
    catch {
        Write-Error "Failed to stop PostgreSQL container"
        throw
    }
}

# データベースの状態表示
function Show-Status {
    $composeCmd = Get-DockerComposeCmd
    
    Write-Info "Database status:"
    & $composeCmd ps
    
    Write-Info ""
    Write-Info "Container logs:"
    & $composeCmd logs postgres --tail=10
}

# メイン処理
function Main {
    Write-Info "Starting database setup with Docker Compose..."
    
    # 各ステップを実行
    if (-not (Test-Docker)) { return }
    if (-not (Test-DockerCompose)) { return }
    
    try {
        Start-Postgres
        if (Wait-ForDatabase) {
            if (Test-DatabaseInitialization) {
                Write-Info "Database is already initialized"
            }
            else {
                Initialize-Database
            }
            
            if (Test-DatabaseConnection) {
                Set-Environment
                
                Write-Success "Database setup completed successfully!"
                Write-Info ""
                Write-Info "Test account credentials:"
                Write-Info "  Email: test@example.com"
                Write-Info "  Password: password"
                Write-Info ""
                Write-Info "To start the backend server:"
                Write-Info "  cd cmd/todo-api"
                Write-Info "  go run main.go"
                Write-Info ""
                Write-Info "To start the frontend server:"
                Write-Info "  cd frontend"
                Write-Info "  npm run dev"
                Write-Info ""
                Write-Info "To stop the database:"
                Write-Info "  docker-compose down"
                Write-Info ""
                Write-Info "To view database logs:"
                Write-Info "  docker-compose logs postgres"
            }
            else {
                Write-Error "Setup failed"
                exit 1
            }
        }
        else {
            Write-Error "Setup failed"
            exit 1
        }
    }
    catch {
        Write-Error "Setup failed: $($_.Exception.Message)"
        exit 1
    }
}

# コマンドライン引数の処理
switch ($Command) {
    "stop" {
        Stop-Database
    }
    "status" {
        Show-Status
    }
    "restart" {
        Stop-Database
        Main
    }
    "" {
        Main
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Info "Usage: .\setup_db.ps1 [stop|status|restart]"
        exit 1
    }
} 