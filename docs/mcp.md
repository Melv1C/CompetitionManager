# MCP Integrations for Competition Manager 🚀

This document outlines the approved Model Context Protocol (MCP) integration endpoints and design patterns for your AI coding assistant.

---

## 1. Context7 MCP (Live API Documentation)

**Purpose:** Provide up-to-date library/API docs (e.g., Hono, Prisma, Socket.IO, Tailwind) to prevent hallucinations.  
**Usage:**  
- Connect Context7 to MCP pipeline.  
- At runtime, fetch latest framework documentation.  
- Enables the assistant to reference accurate signatures, parameters, and deprecations.  
**Why it matters:** Traditional LLMs rely on stale training data; Context7 ensures real-time accuracy.
---

## 2. GitHub API Connector

**Purpose:** Fetch repo metadata, PRs, issues, CI statuses.  
**Usage:**  
- Queries through MCP to validate branch naming, check CI before commit suggestions, or suggest relevant files.  
**Benefit:** Enables "sequential thinking"—assistant can traverse code review -> build status -> change context.

---

## 3. Sequential Thinking / Chain‑of‑Thought

**Purpose:** Break multi-step tasks (e.g., new event flow: DB migration → API route → frontend form) into discrete MCP tool-invoked steps.  
**Pattern:**  
1. LLM outlines plan.  
2. Fetches project tree via GitHub connector.  
3. Applies sequential updates with human checkpoints.  
**Benefit:** Aligns with chain-of-thought best practices for clarity and traceability.


---

## 4. Memory / Sequential Context Management

**Purpose:** Maintain long-term context across interactions—e.g., prior design decisions, migrated patterns, translation consistency.  
**Design:**  
- Use a memory tool to `insert`, `recall`, then `refresh` conversation history.  
- Supports "Think-in-Memory" loop: assistant recalls past reasoning, updates memory after each answer.

---

## 5. Brave Search

**Purpose:** Validate external facts or fetch public docs not in repo (e.g., Belgian athletics regulations, Stripe API updates).  
**Usage:**  
- Query via MCP search tool.  
- Provide citations and snippets for external state or regulation.  
- Editor can confirm or reject accuracy.

---

## Summary Table

| MCP Tool                | Functionality                         | Key Benefit                                        |
|-------------------------|----------------------------------------|----------------------------------------------------|
| **Context7 Docs**        | Live API/framework reference           | Always-valid code scaffolding                      |
| **GitHub API**           | Repo structure, PR/CI metadata         | Smarter refactors, PR pre-checks                  |
| **Sequential Steps**     | Multi-step workflow orchestration      | Traceable and granular execution plan             |
| **Memory Tool**          | Store/recall prior reasoning           | Better continuity, fewer regressions              |
| **Brave Search**         | External fact-checking/references     | Cite-able and up-to-date non-repo info           |