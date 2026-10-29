# Validation Matrix Example (Section 6.1 Enhancement)

## Purpose
To make the "Validation Matrix" concrete and actionable, add a small example in Section 6.1.

## Suggested Addition (Append to Section 6.1)

```markdown
### 検証マトリクスの例

| Requirement | Test Method | Owner | Status |
| :--- | :--- | :--- | :--- |
| Functional: Login works | Unit Test | Coder | ✅ |
| UX: Responsive design | Manual Review | Analyst | ⏳ |
| Business: Priority met | Impact Analysis | Human Reviewer | ✅ |
| Org: Security compliance | Audit | Analyst | ✅ |
| Social: Privacy check | GDPR/CCPA Review | Analyst | ✅ |

**Legend:**
- ✅ Passed
- ⏳ In Progress
- ❌ Failed
```

---

## Rationale
This example makes the abstract concept of a "Validation Matrix" immediately understandable. It shows exactly what information to track and how to format it.
