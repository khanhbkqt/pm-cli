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

## Multi-Client Installation

Install the agent instructions into any supported AI coding client with a single command:

```bash
# Detect which clients are present
pm install --detect

# Install for a specific client
pm install <client>

# Install for all detected clients
pm install --all
```

### Supported Clients

| Client | Command | Generated Config |
|--------|---------|-----------------|
| Antigravity | `pm install antigravity` | `.agent/workflows/pm-guide.md` + `.agent/rules/pm-cli.md` |
| Claude Code | `pm install claude-code` | `CLAUDE.md` (section markers) |
| Cursor | `pm install cursor` | `.cursor/rules/pm-guide.mdc` |
| Codex | `pm install codex` | `AGENTS.md` (section markers) |
| OpenCode | `pm install opencode` | `AGENTS.md` + `opencode.json` |
| Gemini CLI | `pm install gemini-cli` | `GEMINI.md` (section markers) |

Each adapter translates the canonical `AGENT_INSTRUCTIONS.md` into the client's native config format. Existing user content in shared files (e.g. `CLAUDE.md`, `AGENTS.md`) is preserved via section markers.
