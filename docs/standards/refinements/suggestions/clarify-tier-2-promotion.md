# Clarify Tier 2 Promotion (Section 7.1 Enhancement)

## Purpose
To resolve the ambiguity between Section 4.2 (Tier 2 uses standard flow) and Section 7.1 (says Tier 2/3 go to docs/architecture/).

## Suggested Change (Edit Section 7.1, line 148)

**Current:**
```markdown
*   `docs/architecture/`: アーキテクチャ設計、ADR、技術選定の記録 (Permanent: 改定された ADR、Tier 2/3 の設計変更のみ)
```

**Proposed:**
```markdown
*   `docs/architecture/`: アーキテクチャ設計、ADR、技術選定の記録 (Permanent: 改定された ADR、Tier 2/3 の設計変更 **かつ** クロスモジュール影響を持つもの)
```

---

## Rationale
This clarifies that Tier 2 decisions only go to `docs/architecture/` if they have "cross-module impact." Simple Tier 2 changes (like a single feature refactor) can stay in `.opencode/shared/` and be deleted after completion.
