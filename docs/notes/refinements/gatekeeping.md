# Human-in-the-Loop (HITL) Gatekeeping

To ensure the integrity of the development process, a manual review gate is required before moving from the "Analysis" phase to the "Implementation" phase.

## Review Points
- **ADR Approval:** Ensure the proposed architecture/design addresses all requirements.
- **Technical Feasibility:** Confirm that the chosen technology/approach is viable within the current constraints.
- **Impact Assessment:** Verify that the proposed changes won't cause unintended side effects in existing modules.

## Workflow Integration
The workflow should be updated to include a mandatory approval step:
`ADR作成 (Cherry Studio Analyst) -> [Human Review & Approval] -> アーキテクチャ設計`
