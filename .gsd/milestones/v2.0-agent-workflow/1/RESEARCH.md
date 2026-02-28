# Research: Phase 1 — Agent Instruction Document

## Discovery Level: 0 (Skip)

**Rationale:** This phase creates documentation files only. All content derives from the existing codebase — no new external dependencies, APIs, or architectural decisions needed.

## Key Findings (from codebase analysis)

### CLI Command Surface

| Command Group | Subcommands |
|--------------|-------------|
| `pm init` | `[name]` |
| `pm agent` | `register`, `list`, `show`, `whoami` |
| `pm task` | `add`, `list`, `show`, `update`, `assign`, `comment` |
| `pm context` | `set`, `get`, `list`, `search` |
| `pm status` | (no subcommands) |
| `pm dashboard` | (no subcommands) |

### Identity System

- `--agent <name>` flag (global option)
- `PM_AGENT` env var (fallback)
- Priority: `--agent` > `PM_AGENT`
- Most commands require identity; `agent list`, `agent show`, `task list`, `context get/list/search`, `status` do not

### Output Modes

- Human-readable (default) — formatted tables/text
- JSON (`--json` flag) — structured JSON for agent parsing

### Data Types (from `src/db/types.ts`)

- `Agent`: id, name, role, type, created_at
- `Task`: id, title, description, status, priority, assigned_to, created_by, parent_id, created_at, updated_at
- `TaskComment`: id, task_id, agent_id, content, created_at
- `ContextEntry`: id, key, value, category, created_by, created_at, updated_at

### Project Init Structure

- Creates `.pm/` directory with `data.db` (SQLite) and `config.yaml`
- WAL mode enabled for concurrent reads

## Output Location

Documentation files will be created at `docs/agent-guide/` as markdown files.
