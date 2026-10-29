# Quick Start: Your First Analyst Session

本リポジトリをすぐに使い始めるためのガイドです。5 分で始められます！

---

## 🎯 何ができる？

このワークフローを使えば、Cherry Studio と OpenCode Coder を組み合わせて、**「思考のパートナー」として AI**と共創できます：

- **ADR（設計方針）を自動生成**：要件からアーキテクチャ設計まで
- **コード実装と検証**：テスト付きで安全に開発
- **5 つの視点での分析**：Functional, UX, Business, Org, Social を網羅

---

## 🚀 3 ステップで始める

### ステップ 1: Cherry Studio でセッション作成

```
Cherry Studio を開く → 新しい Session を作成する
```

新しいチャットウィンドウが立ち上がります。ここから始めましょう！

---

### ステップ 2: Analyst ペルソナを選択

Session のペルソナ設定で **「Analyst」** を選択します。

**Analyst の役割：**
- 要件を深く分析する思考のパートナー
- 5 つの視点（Functional, UX, Business, Org, Social）から検討
- ADR（設計方針）を提案・生成

---

### ステップ 3: 要件を入力して開始

日本語または英語で、以下の形式で要件を入力します：

```
要件：[何を作りたいか]

- **Functional:** [機能の仕様]
- **UX:** [ユーザー体験の要件]
- **Business:** [優先度や納期など]
- **Org:** [技術制約や既存システムとの統合]
- **Social:** [プライバシーや倫理的な配慮]
```

**例：**

```
要件：ユーザーログイン機能を作成したい。

- **Functional:** ユーザー名とパスワードでログインできる。エラーメッセージを表示する。
- **UX:** レスポンシブデザインで、モバイルでも使いやすい。
- **Business:** 優先度 High。来週金曜日まで納期。
- **Org:** 既存の認証システムと統合する。セキュリティ要件を満たす。
- **Social:** パスワードは暗号化して保存する。GDPR に準拠する。
```

---

## ✅ 流れを確認

1. Analyst が 5 つの視点から分析し、ADR を生成
2. 「承認」ボタンをクリック → 開発フローが開始
3. OpenCode Coder がコードを実装・検証

**完了！** テスト付きの実装と設計ドキュメントが完成します。

---

## 📚 次のステップ

### 学習用サンプルプロジェクト

[User Login Sample](../quickstart-user-login-sample/) で実際のワークフローを確認できます。このサンプルは Quick Start Guide に基づいて作成された学習用プロジェクトです。

- [ADR_001_user_login.md](../quickstart-user-login-sample/ADR_001_user_login.md) - 5 つの視点から生成された設計方針
- [TEST_DOCUMENTATION.md](../quickstart-user-login-sample/TEST_DOCUMENTATION.md) - テストドキュメント
- ソースコードと API ドキュメントも確認できます

### 詳細なルールやベストプラクティス

[開発標準（Development Standards）](development-standard.md) を参照してください。
