# Tooling & Enforcement (New Section 10)

## Purpose
To add practical tooling recommendations for enforcing the standards in practice.

## Suggested Addition (Append as New Section 10 at the end of the document)

```markdown
## 10. ツールと強制（Tooling & Enforcement）

開発標準を確実に遵守するためのツールや手法。

### 10.1 Git Hooks（コミット前のチェック）
- **Pre-commit Hook:** `.opencode/shared/` の未完了データを防止。
- **Post-commit Hook:** 検証ステップの完了を確認。

### 10.2 CI/CD チェック（統合テスト）
- **Verification Step:** 実装後の自動テスト実行。
- **Rollback Check:** ロールバック条件を満たすか確認。

### 10.3 コードレビューテンプレート
```markdown
## Verification Checklist
- [ ] Functional: Unit/Integration Tests passed
- [ ] UX: Responsive design verified
- [ ] Business: Priority requirements met
- [ ] Org: Security compliance checked
- [ ] Social: Privacy impact reviewed
```

### 10.4 メトリクス（KPI）
- **Bug Rate:** バグ発生数 / コード行数
- **Test Coverage:** テストカバレッジ率
- **Review Cycle Time:** レビュー完了までの時間
```

---

## Rationale
This section bridges the gap between "theory" and "practice." It shows how to actually enforce these rules using common developer tools (Git hooks, CI/CD, code review templates).
