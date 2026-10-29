# Quick Start Guide (New Section in README.md)

## Purpose
To add a "Quick Start" section to the README.md for users who want to get started quickly.

## Suggested Addition (Append to README.md, after Section 5)

```markdown
---

## Quick Start: Your First Analyst Session

本リポジトリをすぐに使い始めるための手順。

### ステップ 1: Cherry Studio を開く
- Cherry Studio を起動し、新しいセッションを作成する。

### ステップ 2: Analyst ペルソナを選択
- 「Analyst」ペルソナ（思考のパートナー）を選択する。

### ステップ 3: 要件を入力
- 日本語または英語で要件を入力する。
- **推奨:** 5 つの視点（Functional, UX, Business, Org, Social）を意識して記述する。

### ステップ 4: ADR をレビューし承認
- Cherry Studio が生成した ADR（設計方針）を確認する。
- 承認ボタンをクリックすると、開発フローが開始される。

### ステップ 5: 実装と検証
- OpenCode Coder がコードを実装する。
- 検証ステップでテストが実行され、結果が表示される。

---

## Example Prompt (5 Perspectives)

```
要件：ユーザーログイン機能を作成したい。

- **Functional:** ユーザー名とパスワードでログインできる。エラーメッセージを表示する。
- **UX:** レスポンシブデザインで、モバイルでも使いやすい。
- **Business:** 優先度 High。来週金曜日まで納期。
- **Org:** 既存の認証システムと統合する。セキュリティ要件を満たす。
- **Social:** パスワードは暗号化して保存する。GDPR に準拠する。
```

この例のように、5 つの視点を意識すると、より質の高い設計が得られます。
```

---

## Rationale
This section provides a "low-friction" entry point for new users. It shows exactly how to use the system without requiring them to read the entire standard first.
