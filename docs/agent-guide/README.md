# Agent Workflow Guide

Comprehensive guides for teaching AI coding agents to use `pm` CLI — the multi-agent project management tool.

## Quick Link

**→ [AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md)** — The all-in-one canonical reference. Start here.

This single file contains everything an AI agent needs: command reference, workflows, collaboration patterns, error handling, and best practices. If you only read one file, read this one.

---

## Document Map

| Document | Description |
|----------|-------------|
| [AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md) | **Canonical all-in-one reference** — complete, self-contained agent instructions |
| [cli-reference.md](cli-reference.md) | Detailed CLI command reference with all flags, examples, and JSON output schemas |
| [identity-setup.md](identity-setup.md) | Agent identity registration, configuration, and verification |
| [onboarding.md](onboarding.md) | First-time agent setup — step-by-step checklist from zero to productive |
| [error-handling.md](error-handling.md) | Common errors, recovery strategies, and defensive coding patterns |
| [workflows/task-lifecycle.md](workflows/task-lifecycle.md) | Full task management workflow: find → claim → work → report → complete |
| [workflows/context-sharing.md](workflows/context-sharing.md) | Share decisions, constraints, and project knowledge via key-value store |
| [workflows/collaboration.md](workflows/collaboration.md) | Multi-agent coordination — handoffs, shared decisions, subtask decomposition |

---

## Document Relationships

```
AGENT_INSTRUCTIONS.md (canonical, self-contained)
  ├── condensed from: cli-reference.md
  ├── condensed from: identity-setup.md
  ├── condensed from: onboarding.md
  ├── condensed from: error-handling.md
  ├── condensed from: workflows/task-lifecycle.md
  ├── condensed from: workflows/context-sharing.md
  └── condensed from: workflows/collaboration.md
```

The individual documents provide detailed examples and extended explanations. `AGENT_INSTRUCTIONS.md` provides a concise, scannable version optimized for AI agent consumption.

---

## For Client Integration

> **v2.1 milestone** will create per-client adapters that automatically generate client-specific configuration files from `AGENT_INSTRUCTIONS.md`:
>
> | Client | Generated Config |
> |--------|-----------------|
> | Antigravity | `.agent/workflows/*.md` |
> | Claude Code | `CLAUDE.md` |
> | Cursor | `.cursor/rules/*.mdc` |
> | Codex | `AGENTS.md` |
> | OpenCode | `AGENTS.md` + `opencode.json` |
>
> See the [v2.1-multi-client milestone](../../.gsd/ROADMAP.md) for details.
