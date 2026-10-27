# Context Compression Tips for AI-Assisted Development

## Purpose

This document captures practical techniques for reducing context consumption when working with:

- Cherry Studio
- OpenCode
- Ollama
- Analyst / Coder workflows

The goal is to maximize useful work completed within a single session while minimizing context window exhaustion.

---

# Core Principle

Treat conversations as **working memory** and Markdown documents as **long-term memory**.

```text
Conversation
    ↓
Knowledge Extraction
    ↓
Markdown
    ↓
Shared Memory
```

Never use chat history as the primary knowledge repository.

---

# Tip 1: Compress Knowledge into Shared Memory

## Problem

Long conversations accumulate context rapidly.

Example:

```text
Requirements discussion
↓

Architecture discussion
↓

Implementation planning
↓

Review discussion
↓

Refinement cycles
```

may consume tens of thousands of tokens.

---

## Solution

Regularly extract knowledge into Markdown.

Examples:

```text
Requirements.md

Architecture.md

ADR-001.md

Review_Report.md

AI_Findings.md
```

Store only condensed, reusable knowledge.

---

## Benefit

```text
50,000+ tokens
```

can often be reduced to

```text
2,000–5,000 tokens
```

of structured documentation.

---

# Tip 2: Use English for Shared Memory

## Observation

English documentation generally consumes fewer tokens than equivalent Japanese documentation.

Example:

Japanese:

```markdown
# 認証認可方式の見直し
```

English:

```markdown
# Authentication Strategy Review
```

---

## Recommended

Write the following in English whenever possible:

- ADRs
- Architecture documents
- AI Findings
- Shared Memory documents
- OpenCode working notes

---

## Benefits

- Lower token usage
- More compact terminology
- Better LLM interoperability
- Reduced context growth

---

# Tip 3: Use English During Refinement Sessions

## Observation

Even when the source material is Japanese, conducting refinement interactions in English can significantly reduce context growth.

Workflow:

```text
Japanese Requirement
        ↓

English Analysis
        ↓

English Shared Memory
        ↓

English Refinement
```

---

## Benefit

More iterations can be completed before context saturation occurs.

A single session may remain productive significantly longer.

---

# Tip 4: Separate Thinking from Doing

## Cherry Studio

Role:

```text
Thinking
Analyzing
Designing
Reviewing
```

Produces:

```text
Shared Memory

Requirements

Architecture

ADRs
```

---

## OpenCode

Role:

```text
Understanding Code

Implementing

Refactoring

Testing
```

Consumes:

```text
Shared Memory

Architecture

ADR
```

---

## Benefit

Implementation sessions start with compressed knowledge instead of lengthy conversations.

---

# Tip 5: Reset Sessions Instead of Growing Them Forever

## Anti-Pattern

```text
Requirements

↓

Design

↓

Implementation

↓

Bug Fixes

↓

Reviews

↓

More Design

↓

More Implementation
```

in a single conversation.

---

## Preferred Pattern

```text
Requirements
    ↓
Requirements.md

New Session

Architecture
    ↓
Architecture.md

New Session

Implementation
```

---

## Benefit

Maintains low context utilization.

---

# Tip 6: Promote Ideas Through Memory Layers

Treat information according to maturity.

## Working Memory

Conversation

Characteristics:

```text
Temporary
Exploratory
Disposable
```

Examples:

- brainstorming
- design discussions
- exploratory analysis

---

## Shared Memory

Markdown

Characteristics:

```text
Reviewed
Structured
Reusable
```

Examples:

```text
ADR

Architecture

AI Findings
```

---

## Archived Memory

Reference only.

Examples:

```text
Completed ADRs

Historical Decisions

Retired Designs
```

---

# Tip 7: Watch Context Usage

Suggested thresholds:

## Green

```text
0% - 70%
```

Continue working.

---

## Yellow

```text
70% - 90%
```

Begin summarization.

Update Shared Memory.

---

## Orange

```text
90% - 100%
```

Prepare for session rollover.

Extract findings.

---

## Red

```text
100%+
```

Create a new conversation.

Do not continue accumulating context.

---

# Tip 8: Use ADRs as Compression Artifacts

Instead of preserving lengthy discussions:

```text
Why JWT?

Why Redis?

Why Event Driven?
```

Create an ADR.

Example:

```markdown
# ADR-003 Authentication Strategy

## Context

...

## Decision

Use JWT.

## Alternatives

Session Auth
OAuth

## Consequences

...
```

---

## Benefit

Hundreds of discussion messages become one concise, reusable document.

---

# Tip 9: Minimize Inputs to OpenCode

Before implementation:

Avoid:

```text
Entire Conversation History
```

Prefer:

```text
Requirements.md

Architecture.md

ADRs

Relevant Source Files
```

---

## Benefit

Lower prompt size.

Faster response.

Better implementation quality.

---

# Tip 10: Shared Memory Is the Single Source of Truth

Never rely on:

```text
Memory of previous chats
```

Always rely on:

```text
Shared Memory
```

Examples:

```text
docs/architecture/

docs/adr/

docs/ai-findings/

.opencode/shared/
```

---

# Key Insight

The most effective way to scale AI-assisted development is not increasing context window size.

The most effective way is:

```text
Compress Knowledge
        ↓
Persist Knowledge
        ↓
Reuse Knowledge
```

In practice:

```text
Conversation
        ↓
Shared Memory
        ↓
New Session
```

outperforms

```text
Conversation
        ↓
Conversation
        ↓
Conversation
        ↓
110K Tokens
```

for both performance and maintainability.

