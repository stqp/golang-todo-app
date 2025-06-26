# API 仕様

## 認証
### POST /users/register
- リクエスト
```
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "string",
  "timezone": "Asia/Tokyo",
  "language": "ja"
}
```
- レスポンス
```
{
  "id": "uuid"
}
```
...
