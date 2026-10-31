# Quick Start: Your First Analyst Session

本リポジトリをすぐに使い始めるためのガイドです。5 分で始められます！

---

## 🎯 何ができる？

このワークフローでは、分析（Cherry Studio）と実装・検証（OpenCode）を別ツール・別ペルソナに分けて、**「思考のパートナー」として AI**と共創します：

- **ADR（設計方針）を自動生成**：要件からアーキテクチャ設計まで
- **コード実装と検証**：テスト付きで安全に開発
- **5 つの視点での分析**：Functional, UX, Business, Org, Social を網羅

---

## 🚀 4 フェーズで進める

| フェーズ | ツール | ペルソナ（モデル） | 成果物 |
|---|---|---|---|
| 1. 分析 | Cherry Studio | Analyst（Ethical Architect / `iride:ethical_architect`） | 要件分析・ADR |
| 2. 承認 | 人間 | — | 承認済み ADR |
| 3. 実装 | OpenCode | Coder（Expert Engineer / `iride:expert_engineer`） | コード・テスト |
| 4. 検証 | OpenCode | Auditor（Technical Auditor / `iride:technical_auditor`） | Pass/Fail・指摘 |

### フェーズ 1: 分析 — Cherry Studio / Analyst（Ethical Architect）

```
Cherry Studio を開く → 新しい Session を作成する → ペルソナ「Analyst（Ethical Architect）」を選択
```

**Analyst の役割：**
- 要件を深く分析する思考のパートナー
- 5 つの視点（Functional, UX, Business, Org, Social）から検討
- ADR（設計方針）を提案・生成

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

生成された ADR を確認し、実装に進んでよいか判断します。

### フェーズ 2: 承認 — 人間によるレビュー

生成された ADR をレビューし、承認します。実装前に設計を確定させる Human-in-the-Loop（HITL）ゲートです。設計変更が必要な場合はフェーズ 1 に戻り、ADR を修正します。

### フェーズ 3: 実装 — OpenCode / Coder（Expert Engineer）

承認済み ADR をもとに、OpenCode の `iride:expert_engineer` で実装とテストを生成します。ADR から逸脱する必要が出た場合は実装を止め、フェーズ 1 の再分析に戻します。

### フェーズ 4: 検証 — OpenCode / Auditor（Technical Auditor）

OpenCode の `iride:technical_auditor` で、実装が ADR に適合しているか、セキュリティ・回帰・副作用に問題がないかを検証します。Pass/Fail と修正点を確認し、必要ならフェーズ 3 に戻します。

---

## ✅ 完了時の状態

- 承認済みの ADR（設計ドキュメント）
- ADR に基づく実装コードとテスト
- Auditor による検証結果（Pass/Fail・指摘事項）

**完了！** 設計・実装・検証が一連の流れとして揃います。

---

## 📚 次のステップ

### 学習用サンプルプロジェクト

[User Login Sample](quickstart-user-login-sample/) で実際のワークフローを確認できます。このサンプルは Quick Start Guide に基づいて作成された学習用プロジェクトです。

- [ADR_001_user_login.md](quickstart-user-login-sample/ADR_001_user_login.md) - 5 つの視点から生成された設計方針
- [TEST_DOCUMENTATION.md](quickstart-user-login-sample/TEST_DOCUMENTATION.md) - テストドキュメント
- ソースコードと API ドキュメントも確認できます

### 詳細なルールやベストプラクティス

[開発標準（Development Standards）](development-standard.md) を参照してください。
