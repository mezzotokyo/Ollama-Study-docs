# Task Failure & Recovery (New Section 9)

## Purpose
To add a new section on what to do when tasks fail or cannot be completed.

## Suggested Addition (Append as New Section 9 at the end of the document)

```markdown
## 9. タスク失敗と回復（Task Failure & Recovery）

開発プロセスにおいて、AI がタスクを完了できない場合や、Human Review で承認されない場合の対応方針。

### 9.1 Coder の失敗（実装不能）
- **原因:** 要件が不明確、技術的制約、依存関係の問題など。
- **対応:** Analyst は即座に再分析を行い、要件を修正または簡素化する。
- **ロールバック:** 直前の「要求分析」フェーズに戻り、ADR を再作成する。

### 9.2 Human Review の失敗（承認不能）
- **原因:** 設計が要件を満たさない、技術的リスクが高いなど。
- **対応:** Analyst はレビューコメントを精査し、設計を修正する。
- **ロールバック:** 「設計更新」フェーズに戻り、再度 Human Review を依頼する。

### 9.3 再試行の制限（Retry Limit）
- 同じタスクが 3 回以上失敗した場合、プロジェクトリーダーに報告し、手動介入を要請する。
```

---

## Rationale
This section provides a clear "escape hatch" for when things go wrong. It prevents the team from getting stuck in an infinite loop of failed attempts and establishes a protocol for escalation.
