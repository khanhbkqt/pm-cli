# PM CLI Reference — Agent Guide

This document describes every `pm` CLI command for AI agent consumption. All commands, flags, output formats, and JSON schemas are documented here.

## Global Options

| Option | Description |
|--------|-------------|
| `--agent <name>` | Set agent identity for this command |
| `--json` | Output machine-readable JSON instead of human-readable text |

### Agent Identity Resolution

Identity is resolved in this order:

1. `--agent <name>` flag (highest priority)
2. `PM_AGENT` environment variable
3. Error if neither is set (for commands requiring identity)

Most commands that **create or modify** data require agent identity. Read-only commands (list, show, search, status) do not.

---

## `pm init`

Initialize a new PM project in the current directory.

```
pm init [name]
```

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Project name (defaults to directory name) |

**Human output:**

```
✓ Project "my-project" initialized successfully.
  Created: .pm/
  Database: data.db (6 tables, WAL mode)
  Config: config.yaml
```

**Error cases:**

| Error | Message |
|-------|---------|
| Already initialized | `Error: Project already initialized. .pm/ directory already exists.` |

**Exit codes:** `0` success, `1` error.

> Note: `pm init` does not support `--json` output. It always prints human-readable text.

---

## `pm agent register`

Register a new agent.

```
pm agent register <name> --role <role> --type <type>
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<name>` | Yes | Agent name (unique identifier) |
| `--role <role>` | Yes | Role: `developer`, `reviewer`, `pm`, `researcher`, etc. |
| `--type <type>` | Yes | Type: `human` or `ai` |

**Human output:**

```
✓ Agent 'atlas' registered (id: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
```

**JSON output** (`--json`):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-02-28T14:30:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| Duplicate name | `Error: Agent 'atlas' already exists` |

**Exit codes:** `0` success, `1` error.

---

## `pm agent list`

List all registered agents.

```
pm agent list
```

No arguments or flags.

**Human output:**

```
 Name    │ Role      │ Type   │ Created
─────────┼───────────┼────────┼───────────
 atlas   │ developer │ ai     │ 2026-02-28
 reviewer│ reviewer  │ ai     │ 2026-02-28
```

**JSON output** (`--json`):

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "atlas",
    "role": "developer",
    "type": "ai",
    "created_at": "2026-02-28T14:30:00.000Z"
  }
]
```

**Empty result:** Human: `No agents registered.` / JSON: `[]`

**Exit codes:** `0` success, `1` error.

---

## `pm agent show`

Show details of a specific agent.

```
pm agent show <name>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes | Agent name to look up |

**Human output:**

```
Name:  atlas
Role:  developer
Type:  ai
ID:    a1b2c3d4-e5f6-7890-abcd-ef1234567890
Since: 2026-02-28
```

**JSON output** (`--json`):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-02-28T14:30:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| Not found | `Error: Agent 'unknown-agent' not found` |

**Exit codes:** `0` success, `1` error.

---

## `pm agent whoami`

Show the current agent identity (resolved from `--agent` flag or `PM_AGENT` env var).

```
pm agent whoami
```

No arguments. Requires identity to be set.

**Human output:**

```
Name:  atlas
Role:  developer
Type:  ai
ID:    a1b2c3d4-e5f6-7890-abcd-ef1234567890
Since: 2026-02-28
```

**JSON output** (`--json`):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-02-28T14:30:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| No identity set | `Error: Agent identity required. Use --agent <name> or set PM_AGENT environment variable.` |
| Agent not found | `Error: Agent '<name>' not found` |

**Exit codes:** `0` success, `1` error.

---

## `pm milestone create`

Create a new milestone. **Requires agent identity.**

```
pm milestone create <id> <name> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<id>` | Yes | Milestone slug (used as DB identifier, e.g. `v1-mvp`) |
| `<name>` | Yes | Human-readable milestone name |
| `--goal <text>` | No | Goal description |

**Exit codes:** `0` success, `1` error.

---

## `pm milestone list`

List all milestones.

```
pm milestone list [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--status <status>` | No | Filter by status: `planned`, `active`, `completed`, `archived` |

**Exit codes:** `0` success, `1` error.

---

## `pm milestone show`

Show milestone details.

```
pm milestone show <id>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Milestone slug |

**Exit codes:** `0` success, `1` error.

---

## `pm milestone update`

Update milestone fields. **Requires agent identity.**

```
pm milestone update <id> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<id>` | Yes | Milestone slug |
| `--status <status>` | No | New status: `planned`, `active`, `completed`, `archived` |
| `--goal <text>` | No | Updated goal text |
| `--force` | No | Force status transition (bypass phase completion checks) |

**Workflow transitions:** `planned → active → completed → archived`

**Exit codes:** `0` success, `1` error.

---

## `pm phase add`

Add a phase to a milestone. **Requires agent identity.**

```
pm phase add <name> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<name>` | Yes | Phase name |
| `--number <n>` | Yes | Phase ordering number |
| `--milestone <slug>` | No | Milestone slug (defaults to active milestone) |
| `--description <text>` | No | Phase description |

**Exit codes:** `0` success, `1` error.

---

## `pm phase list`

List phases for a milestone.

```
pm phase list [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--milestone <slug>` | No | Milestone slug (defaults to active milestone) |

**Exit codes:** `0` success, `1` error.

---

## `pm phase show`

Show phase details.

```
pm phase show <id>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Phase DB integer ID (not the phase number) |

> **Note:** Use `pm phase list --json` to find the DB ID.

**Exit codes:** `0` success, `1` error.

---

## `pm phase update`

Update phase fields. **Requires agent identity.**

```
pm phase update <id> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<id>` | Yes | Phase DB integer ID |
| `--status <status>` | No | New status: `not_started`, `planning`, `in_progress`, `completed`, `skipped` |
| `--number <n>` | No | Updated phase number |
| `--force` | No | Force status transition |

**Workflow transitions:** `not_started → planning → in_progress → completed` (also: `→ skipped`)

**Exit codes:** `0` success, `1` error.

---

## `pm plan create`

Create a plan within a phase. **Requires agent identity.**

```
pm plan create <name> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<name>` | Yes | Plan name |
| `--phase <id>` | Yes | Phase DB integer ID |
| `--number <n>` | Yes | Plan number within the phase |
| `--wave <n>` | No | Wave number for parallel execution (default: `1`) |
| `--content <text>` | No | Plan content/description |

**Exit codes:** `0` success, `1` error.

---

## `pm plan list`

List plans for a phase.

```
pm plan list [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--phase <id>` | Yes | Phase DB integer ID |
| `--status <status>` | No | Filter by status |

**Exit codes:** `0` success, `1` error.

---

## `pm plan show`

Show plan details.

```
pm plan show <id>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Plan DB integer ID |

**Exit codes:** `0` success, `1` error.

---

## `pm plan update`

Update plan fields. **Requires agent identity.**

```
pm plan update <id> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<id>` | Yes | Plan DB integer ID |
| `--status <status>` | No | New status: `pending`, `in_progress`, `completed`, `failed` |
| `--content <text>` | No | Updated plan content |

**Workflow transitions:** `pending → in_progress → completed` (also: `→ failed`)

**Exit codes:** `0` success, `1` error.

---

## `pm plan board`

Show plans as a kanban board grouped by status.

```
pm plan board [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--phase <id>` | No | Phase DB integer ID (defaults to active phase) |

**Human output:**

```
╔══════════════════╗  ╔══════════════════╗  ╔══════════════════╗
║    PENDING (2)   ║  ║ IN PROGRESS (1)  ║  ║  COMPLETED (3)   ║
╠══════════════════╣  ╠══════════════════╣  ╠══════════════════╣
║ Plan 4: API docs ║  ║ Plan 2: Auth     ║  ║ Plan 1: Setup    ║
║ Plan 5: Tests    ║  ║                  ║  ║ Plan 3: DB       ║
╚══════════════════╝  ╚══════════════════╝  ╚══════════════════╝
```

> Note: `pm plan board` only has human output, not JSON. Use `pm plan list --json` for machine-readable data.

**Exit codes:** `0` success, `1` error.

---

## `pm progress`

Show active milestone progress.

```
pm progress [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--milestone <id>` | No | Show a specific milestone by slug (defaults to active milestone) |

**Human output:**

```
📊 Milestone: v1-mvp (active)
   Goal: Ship minimum viable product

   Phase 1: Foundation [████████████] 100% ✅
   Phase 2: Core API   [██████░░░░░░]  50% 🔄
   Phase 3: Frontend   [░░░░░░░░░░░░]   0% ⬜
```

**Exit codes:** `0` success, `1` error.

---

## `pm install`

Install AI agent config for a specific client or all detected clients.

```
pm install [client] [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `[client]` | No | Client name: `antigravity`, `cursor`, `claude-code`, `codex`, `opencode`, `gemini-cli` |
| `--all` | No | Install for all detected clients |
| `--detect` | No | Detect AI clients present in the project (no changes made) |
| `--force` | No | Overwrite existing files without section merging |

**Exit codes:** `0` success, `1` error.

---

## `pm context set`

Set a shared context entry. **Requires agent identity.**

```
pm context set <key> <value> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<key>` | Yes | Context key (unique identifier) |
| `<value>` | Yes | Context value |
| `--category <category>` | No | Category: `decision`, `spec`, `note`, `constraint` (default: `note`) |

**Human output:**

```
✓ Context 'api-version' set.
```

**JSON output** (`--json`):

```json
{
  "id": 1,
  "key": "api-version",
  "value": "v2",
  "category": "decision",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T14:30:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| No identity | `Error: Agent identity required.` |

**Exit codes:** `0` success, `1` error.

---

## `pm context get`

Get a context entry by key.

```
pm context get <key>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<key>` | Yes | Context key to look up |

**Human output:**

```
Key:      api-version
Value:    v2
Category: decision
Creator:  a1b2c3d4-e5f6-7890-abcd-ef1234567890
Created:  2026-02-28T14:30:00.000Z
Updated:  2026-02-28T14:30:00.000Z
```

**JSON output** (`--json`):

```json
{
  "id": 1,
  "key": "api-version",
  "value": "v2",
  "category": "decision",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T14:30:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| Not found | `Context key 'unknown-key' not found.` |

**Exit codes:** `0` success, `1` error.

---

## `pm context list`

List all context entries with optional category filter.

```
pm context list [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--category <category>` | No | Filter by category: `decision`, `spec`, `note`, `constraint` |

**Human output:**

```
 Key         │ Value │ Category │ Creator
─────────────┼───────┼──────────┼────────────────────────────────────────
 api-version │ v2    │ decision │ a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**JSON output** (`--json`):

```json
[
  {
    "id": 1,
    "key": "api-version",
    "value": "v2",
    "category": "decision",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-02-28T14:30:00.000Z",
    "updated_at": "2026-02-28T14:30:00.000Z"
  }
]
```

**Empty result:** Human: `No context entries.` / JSON: `[]`

**Exit codes:** `0` success, `1` error.

---

## `pm context search`

Search context entries by key or value (substring match).

```
pm context search <query>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<query>` | Yes | Search term (matched against key and value) |

**Human output:** Same table format as `pm context list`.

**JSON output** (`--json`): Same array format as `pm context list`.

**Empty result:** Human: `No context entries.` / JSON: `[]`

**Exit codes:** `0` success, `1` error.

---

## `pm status`

Show project status overview.

```
pm status
```

No arguments or flags.

**Human output:**

```
📋 Project Status
─────────────────
Agents:  3 registered
Plans:   12 total (4 pending, 3 in_progress, 5 completed)
Context: 8 entries
```

**JSON output** (`--json`):

```json
{
  "agents": 3,
  "plans": {
    "total": 12,
    "pending": 4,
    "in_progress": 3,
    "completed": 5,
    "failed": 0
  },
  "context": 8
}
```

**Exit codes:** `0` success, `1` error.

---

## `pm dashboard`

Launch the project dashboard in the browser.

```
pm dashboard [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--port <number>` | No | Preferred port (default: `4000`) |
| `--no-open` | No | Don't auto-open browser |

**Output:**

```
🚀 Dashboard running at http://localhost:4000
Press Ctrl+C to stop
```

This is a long-running command. It starts an Express server and blocks until terminated with `Ctrl+C` or `SIGTERM`.

> Note: Agents typically do not need `pm dashboard`. Use the CLI commands and `--json` flag instead.

**Exit codes:** `0` on graceful shutdown, `1` error.

---

## Output Schemas

All JSON output conforms to these TypeScript interfaces:

### Milestone

```typescript
interface Milestone {
  id: string;                                                   // Slug identifier
  name: string;
  goal: string | null;
  status: "planned" | "active" | "completed" | "archived";
  created_at: string;                                           // ISO 8601 timestamp
  completed_at: string | null;
}
```

### Phase

```typescript
interface Phase {
  id: number;                                                   // Auto-increment
  milestone_id: string;                                         // Milestone slug
  number: number;                                               // Phase ordering number
  name: string;
  description: string | null;
  status: "not_started" | "planning" | "in_progress" | "completed" | "skipped";
  created_at: string;                                           // ISO 8601 timestamp
  completed_at: string | null;
}
```

### Agent

```typescript
interface Agent {
  id: string;          // UUID
  name: string;        // Unique agent name
  role: string;        // e.g. "developer", "reviewer"
  type: "human" | "ai";
  created_at: string;  // ISO 8601 timestamp
}
```

### Plan

```typescript
interface Plan {
  id: number;                                      // Auto-increment
  phase_id: number;                                // Parent phase ID
  number: number;                                  // Plan number within phase
  name: string;
  wave: number;                                    // Wave number for parallel execution
  status: "pending" | "in_progress" | "completed" | "failed";
  content: string | null;                          // Plan content/description
  created_at: string;                              // ISO 8601 timestamp
  completed_at: string | null;                     // ISO 8601 timestamp or null
}
```

### ContextEntry

```typescript
interface ContextEntry {
  id: number;                                              // Auto-increment
  key: string;                                             // Unique key
  value: string;
  category: "decision" | "spec" | "note" | "constraint";
  created_by: string;                                      // Agent ID
  created_at: string;                                      // ISO 8601 timestamp
  updated_at: string;                                      // ISO 8601 timestamp
}
```

### Status

```typescript
interface Status {
  agents: number;
  plans: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
  };
  context: number;
}
```
