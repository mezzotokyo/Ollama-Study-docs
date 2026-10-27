# Memory Lifecycle & SSOT Management (Scalability-Focused)
 
To maintain the **Single Source of Truth (SSOT)** and ensure the project can scale without information rot, we manage the lifecycle of information within the Shared Memory using a tiered escalation model.
 
## 1. Storage Tiers & Scalability
- **Dynamic/Intermediate (`.opencode/shared/`):** For active analysis, draft ADRs, and exploratory findings. **Scalability Rule:** Data here is ephemeral. It must be purged or promoted within the same development cycle to prevent "context bloat."
- **Permanent/Architectural (`docs/architecture/`):** For approved ADRs, permanent technical decisions, and structural designs. **Scalability Rule:** Only "Tier 2/3" decisions with cross-module impact are promoted here. 
- **AI Findings (`docs/ai-findings/`):** For deep-dive analysis, refactoring proposals, and accumulated technical debt reports. This serves as the "Archive" for high-value research that doesn't require architectural locking.
 
## 2. Promotion & Scaling Protocol
- **Impact-Based Promotion:** Decisions are promoted to `docs/architecture/` only when they impact multiple modules or represent a Tier 3 Architectural change.
- **Verification-First Promotion:** No entry is moved to Permanent storage without a **Validation Matrix** (as defined in the Development Standard).
- **Cleanup & Maintenance:** 
    - **Atomic Cleanup:** The `OpenCode Coder` must ensure that `.opencode/shared/` is cleared of task-specific data immediately upon the completion of the `Validation` step.
    - **Periodic Audit:** Every 10-15 significant changes, the `Analyst` must perform a "Common Memory Audit" to identify and archive stale data.
 
## 3. Consistency with Development Standard
Every task must conclude with a **Common Memory Update** that reflects the current state of these tiers, ensuring the **Single Source of Truth** is always synchronized with the active codebase.
