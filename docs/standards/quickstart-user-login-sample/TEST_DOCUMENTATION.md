# テストドキュメント

## 概要

このドキュメントは、User Login Application の認証機能に関するテストケースと結果を記載しています。

## テスト環境

- **フレームワーク**: Jest
- **言語**: TypeScript
- **テスト対象**: `src/auth/authController.ts`

## テスト結果

```
PASS src/auth/authController.test.ts
  AuthController
    register
      ✓ should register a new user successfully (4 ms)
      ✓ should return error for invalid username (1 ms)
      ✓ should return error for invalid password
    login
      ✓ should login successfully
      ✓ should return error for invalid credentials
    logout
      ✓ should logout successfully (1 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.023 s
```

## テストケース詳細

### 1. ユーザー登録 - 成功

**テスト名**: `should register a new user successfully`

**前提条件**:
- 新規ユーザー（既存ユーザーではない）
- ユーザー名：3 文字以上
- パスワード：8 文字以上

**入力データ**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**期待結果**:
- ステータスコード：201 Created
- レスポンスボディ:
  ```json
  {
    "success": true,
    "user": {
      "id": "1",
      "username": "testuser",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

**結果**: ✅ パス

---

### 2. ユーザー登録 - 無効なユーザー名

**テスト名**: `should return error for invalid username`

**前提条件**:
- ユーザー名が 3 文字未満

**入力データ**:
```json
{
  "username": "ab",
  "password": "password123"
}
```

**期待結果**:
- ステータスコード：400 Bad Request
- レスポンスボディ:
  ```json
  {
    "success": false,
    "error": "ユーザー名は 3 文字以上必要です"
  }
  ```

**結果**: ✅ パス

---

### 3. ユーザー登録 - 無効なパスワード

**テスト名**: `should return error for invalid password`

**前提条件**:
- パスワードが 8 文字未満

**入力データ**:
```json
{
  "username": "testuser",
  "password": "pass123"
}
```

**期待結果**:
- ステータスコード：400 Bad Request
- レスポンスボディ:
  ```json
  {
    "success": false,
    "error": "パスワードは 8 文字以上必要です"
  }
  ```

**結果**: ✅ パス

---

### 4. ログイン - 成功

**テスト名**: `should login successfully`

**前提条件**:
- 有効なユーザーが存在
- ユーザー名とパスワードが一致

**入力データ**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**期待結果**:
- ステータスコード：200 OK
- レスポンスボディ:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-01T01:00:00.000Z"
  }
  ```

**結果**: ✅ パス

---

### 5. ログイン - 無効な認証情報

**テスト名**: `should return error for invalid credentials`

**前提条件**:
- ユーザーが存在
- パスワードが間違っている

**入力データ**:
```json
{
  "username": "testuser",
  "password": "wrongpassword"
}
```

**期待結果**:
- ステータスコード：401 Unauthorized
- レスポンスボディ:
  ```json
  {
    "success": false,
    "error": "無効なパスワード"
  }
  ```

**結果**: ✅ パス

---

### 6. ログアウト - 成功

**テスト名**: `should logout successfully`

**前提条件**:
- リフレッシュトークンが存在

**入力データ**:
```
Authorization: Bearer <refreshToken>
```

**期待結果**:
- ステータスコード：200 OK
- レスポンスボディ:
  ```json
  {
    "success": true
  }
  ```

**結果**: ✅ パス

---

## カバレッジ

| 機能 | テスト数 | 結果 |
|------|----------|------|
| ユーザー登録（成功） | 1 | ✅ |
| ユーザー登録（無効なユーザー名） | 1 | ✅ |
| ユーザー登録（無効なパスワード） | 1 | ✅ |
| ログイン（成功） | 1 | ✅ |
| ログイン（無効な認証情報） | 1 | ✅ |
| ログアウト（成功） | 1 | ✅ |
| **合計** | **6** | **100%** |

## 今後の改善点

- ユーザー名が既に存在する場合のテスト
- CSRF トークン検証のテスト
- 本番環境でのデータベース統合テスト
- API ドキュメント（Swagger/OpenAPI）
- インテグレーションテスト
- エンドツーエンドテスト
