# Hybrid & Complexity-Based Workflows

Not all tasks fit perfectly into "Greenfield" or "Brownfield" categories. We need a way to handle hybrid tasks and scale the workflow based on complexity.

## 1. Hybrid Tasks
Tasks that involve both creating new features and modifying existing infrastructure require a hybrid approach.
- **Action:** Perform a "Scope Assessment" at the start of the Analysis phase to identify which parts of the task are Greenfield and which are Brownfield.

## 2. Complexity Tiers
To maintain efficiency, we categorize tasks into tiers:

| Tier | Description | Workflow |
| :--- | :--- | :--- |
| **Tier 1 (Minor)** | Typos, style changes, simple bug fixes. | Skip ADR. Go directly to Coder. |
| **Tier 2 (Standard)** | New features, refactors, logic changes. | Full standard workflow. |
| **Tier 3 (Architectural)** | Database changes, new modules, security overhauls. | Enhanced Analyst involvement (Deep-dive). |
