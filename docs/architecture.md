# アーキテクチャ概要

このドキュメントでは、TODOアプリケーションの全体アーキテクチャとシステム設計について説明します。

## 1. システム全体像

本システムは以下の3層構造で構成されています。

- **フロントエンド**: React + TypeScript（Chakra UI, React Router, React Query利用）
- **バックエンドAPI**: Go（Chi, DDD設計, JWT認証, PostgreSQL）
- **データベース**: PostgreSQL

## 2. フォルダ構成

- `cmd/todo-api/` : Goバックエンドのエントリポイント
- `internal/`   : DDDバウンデッドコンテキストごとに分割されたドメイン・ユースケース・リポジトリ・ハンドラ
  - `user/`, `project/`, `task/`, `comment/`, `notification/`
  - `infrastructure/` : DB, 認証, メール送信など外部連携
  - `common/` : 共通ミドルウェア、エラー、ロガー、ユーティリティ
- `frontend/` : Reactフロントエンド
  - `src/pages/` : 各画面（ログイン、ダッシュボード、プロジェクト、タスク等）
  - `src/components/` : レイアウト等の共通コンポーネント
  - `src/api/` : AxiosによるAPIクライアント
  - `src/contexts/` : 認証コンテキスト
- `requirement/` : 業務要件・機能要件ドキュメント

## 3. フロントエンド設計

- **SPA構成**で、React Routerによるページ遷移
- Chakra UIによるUI設計
- React QueryでAPIデータのキャッシュ・取得
- AxiosでAPI通信（JWTトークンを自動付与）
- 主な画面: ログイン、ユーザー登録、ダッシュボード、プロジェクト一覧・詳細、タスク一覧・詳細

## 4. バックエンド設計

- **Go + Chi**によるRESTful API
- DDD（ドメイン駆動設計）で各機能を分離
  - `domain/` : エンティティ・値オブジェクト
  - `usecase/` : アプリケーションロジック
  - `repository/` : DBアクセス
  - `handler/` : HTTPハンドラ
- JWT認証（`/users/login`, `/users/register`は認証不要）
- PostgreSQL接続は環境変数またはデフォルトDSN
- 各エンドポイントは`/users`, `/projects`, `/tasks`等で分離

## 5. 認証・認可

- JWTによるトークン認証
- 認証不要エンドポイント: `/users/login`, `/users/register`
- それ以外は全てJWT必須
- トークンはフロントエンドでlocalStorageに保存し、APIリクエスト時に自動付与

## 6. 主なAPIエンドポイント例

- `POST /users/register` ユーザー登録
- `POST /users/login` ログイン（JWT発行）
- `GET /users/me` 自分の情報取得
- `GET /projects` プロジェクト一覧
- `POST /projects` プロジェクト作成
- `GET /projects/{projectID}` プロジェクト詳細
- `GET /projects/{projectID}/tasks` プロジェクトのタスク一覧
- `POST /projects/{projectID}/members/{userID}` プロジェクトにメンバー追加
- `GET /tasks` タスク一覧
- `POST /tasks` タスク作成
- `GET /tasks/{taskID}` タスク詳細

## 7. データベース設計

- PostgreSQLを使用
- 各エンティティ（ユーザー、プロジェクト、タスク等）はUUIDまたは一意なIDで管理
- 外部キー制約でリレーションを管理

## 8. ミドルウェア・共通処理

- ログ出力（Zap）
- エラーハンドリング
- JWT認証ミドルウェア
- CORS, リクエストロギング

## 9. テスト

- フロントエンド: PlaywrightによるE2E/UI/APIテスト
- バックエンド: Goのユニットテスト（未整備の場合は今後追加）
