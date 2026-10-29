# User Login Application

このプロジェクトは、「AI 共創型開発ワークフロー：思考のパートナーとしての LLM」の Quick Start Guide に基づいて作成された学習用サンプルです。

## 目的

このプロジェクトは、TypeScript と Express を使用した安全なユーザー認証システムを実装することを目的としています。

主な目標：
- **セキュリティ**: bcrypt (cost 12) でパスワードをハッシュ化し、JWT と http-only Cookie でトークンを保護
- **開発体験**: TypeScript で型安全性を確保し、テスト駆動開発を支援
- **拡張性**: モダンなアーキテクチャで、後続の機能追加やデータベース統合に対応可能
- **GDPR 準拠**: ユーザーデータの保護とプライバシー尊重を重視

## 機能

- ユーザー登録
- ログイン
- ログアウト
- JWT ベースの認証
- http-only Cookie セキュリティ
- CSRF 保護

## 依存関係

```bash
npm install
```

## 環境設定

```bash
cp .env.example .env
```

`.env` ファイルを編集して、以下の値を設定してください：

- `ACCESS_TOKEN_SECRET` - アクセストークンのシークレット
- `REFRESH_TOKEN_SECRET` - リフレッシュトークンのシークレット

## 開発

```bash
npm run dev
```

## 本番

```bash
npm start
```

## テスト

```bash
npm test
```

## 型チェック

```bash
npm run typecheck
```

## プロジェクト構造

```
src/
├── types/
│   └── auth.ts          # タイプ定義
├── utils/
│   ├── crypto.ts        # クリプト関数
│   ├── jwt.ts           # JWT 関数
│   └── index.ts
├── auth/
│   ├── authService.ts   # 認証ロジック
│   ├── authController.ts # コントローラー
│   └── index.ts
└── server.ts            # Express サーバー
```

## API エンドポイント

### POST /api/auth/register
ユーザー登録

**リクエストボディ:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "user123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/login
ログイン

**リクエストボディ:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-01-01T01:00:00.000Z"
}
```

### POST /api/auth/logout
ログアウト

**リクエストヘッダー:**
```
Authorization: Bearer <refreshToken>
```

**レスポンス:**
```json
{
  "success": true
}
```

## セキュリティ

- パスワードは bcrypt (cost 12) でハッシュ化
- JWT アクセストークンとリフレッシュトークンの使用
- http-only Cookie でトークン保護
- CORS と Helmet でセキュリティ強化
- CSRF トークン保護

## 制限

- ユーザー名：3 文字以上
- パスワード：8 文字以上
- 現在、In-memory ストアを使用（本番ではデータベースに交換）

## 関連ドキュメント

| ドキュメント | ファイル |
|--------------|----------|
| 開発標準 | `development-standard.md` |
| クイックスタートガイド | `quick-start-guide.md` |
| 設計方針（ADR-001） | `ADR_001_user_login.md` |
| テストドキュメント | `TEST_DOCUMENTATION.md` |
