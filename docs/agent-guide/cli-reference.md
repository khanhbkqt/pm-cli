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
  Database: data.db (4 tables, WAL mode)
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

## `pm task add`

Create a new task. **Requires agent identity.**

```
pm task add <title> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<title>` | Yes | Task title |
| `--description <desc>` | No | Task description |
| `--priority <priority>` | No | Priority: `low`, `medium`, `high`, `urgent` |
| `--parent <id>` | No | Parent task ID (creates a subtask) |

**Human output:**

```
✓ Task #1 created: "Implement user authentication"
```

**JSON output** (`--json`):

```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add JWT-based auth to all API endpoints",
  "status": "todo",
  "priority": "high",
  "assigned_to": null,
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent_id": null,
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T14:30:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| No identity | `Error: Agent identity required. Use --agent <name> or set PM_AGENT environment variable.` |

**Exit codes:** `0` success, `1` error.

---

## `pm task list`

List tasks with optional filters.

```
pm task list [options]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--status <status>` | No | Filter by status (e.g., `todo`, `in-progress`, `done`) |
| `--assigned <agent>` | No | Filter by assigned agent name |
| `--parent <id>` | No | Filter by parent task ID |

**Human output:**

```
 ID │ Title                         │ Status      │ Priority │ Assigned
────┼───────────────────────────────┼─────────────┼──────────┼─────────
 1  │ Implement user authentication │ in-progress │ high     │ atlas
 2  │ Write unit tests              │ todo        │ medium   │ -
```

**JSON output** (`--json`):

```json
[
  {
    "id": 1,
    "title": "Implement user authentication",
    "description": "Add JWT-based auth to all API endpoints",
    "status": "in-progress",
    "priority": "high",
    "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "parent_id": null,
    "created_at": "2026-02-28T14:30:00.000Z",
    "updated_at": "2026-02-28T15:00:00.000Z"
  }
]
```

**Empty result:** Human: `No tasks found.` / JSON: `[]`

**Exit codes:** `0` success, `1` error.

---

## `pm task show`

Show task details including comments.

```
pm task show <id>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Task ID (numeric) |

**Human output:**

```
ID:       #1
Title:    Implement user authentication
Status:   in-progress
Priority: high
Assigned: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Creator:  a1b2c3d4-e5f6-7890-abcd-ef1234567890
Parent:   none
Desc:     Add JWT-based auth to all API endpoints
Created:  2026-02-28T14:30:00.000Z
Updated:  2026-02-28T15:00:00.000Z

Comments:
[2026-02-28T15:30:00.000Z] a1b2c3d4-e5f6-7890-abcd-ef1234567890: Started working on JWT middleware
```

**JSON output** (`--json`):

```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add JWT-based auth to all API endpoints",
  "status": "in-progress",
  "priority": "high",
  "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent_id": null,
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T15:00:00.000Z",
  "comments": [
    {
      "id": 1,
      "task_id": 1,
      "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "content": "Started working on JWT middleware",
      "created_at": "2026-02-28T15:30:00.000Z"
    }
  ]
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| Not found | `Error: Task #99 not found.` |

**Exit codes:** `0` success, `1` error.

---

## `pm task update`

Update task fields. **Requires agent identity.**

```
pm task update <id> [options]
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<id>` | Yes | Task ID (numeric) |
| `--title <title>` | No | New title |
| `--description <desc>` | No | New description |
| `--status <status>` | No | New status (`todo`, `in-progress`, `done`, etc.) |
| `--priority <priority>` | No | New priority (`low`, `medium`, `high`, `urgent`) |

**Human output:**

```
✓ Task #1 updated
```

**JSON output** (`--json`):

```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add JWT-based auth to all API endpoints",
  "status": "done",
  "priority": "high",
  "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent_id": null,
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T16:00:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| No identity | `Error: Agent identity required.` |
| Not found | `Error: Task #99 not found.` |

**Exit codes:** `0` success, `1` error.

---

## `pm task assign`

Assign a task to an agent. **Requires agent identity.**

```
pm task assign <id> --to <agent>
```

| Argument/Flag | Required | Description |
|---------------|----------|-------------|
| `<id>` | Yes | Task ID (numeric) |
| `--to <agent>` | Yes | Agent name to assign to |

**Human output:**

```
✓ Task #1 assigned to 'atlas'
```

**JSON output** (`--json`):

```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add JWT-based auth to all API endpoints",
  "status": "todo",
  "priority": "high",
  "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent_id": null,
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T16:00:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| No identity | `Error: Agent identity required.` |
| Agent not found | `Error: Agent 'unknown-agent' not found.` |

**Exit codes:** `0` success, `1` error.

---

## `pm task comment`

Add a comment to a task. **Requires agent identity.**

```
pm task comment <id> <message>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `<id>` | Yes | Task ID (numeric) |
| `<message>` | Yes | Comment text |

**Human output:**

```
✓ Comment added to task #1
```

**JSON output** (`--json`):

```json
{
  "id": 1,
  "task_id": 1,
  "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Completed JWT middleware implementation",
  "created_at": "2026-02-28T16:30:00.000Z"
}
```

**Error cases:**

| Error | Message |
|-------|---------|
| No identity | `Error: Agent identity required.` |
| Task not found | `Error: Task #99 not found.` |

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
Tasks:   12 total (4 todo, 3 in-progress, 5 done)
Context: 8 entries
```

**JSON output** (`--json`):

```json
{
  "agents": 3,
  "tasks": {
    "total": 12,
    "todo": 4,
    "in-progress": 3,
    "done": 5
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

### Task

```typescript
interface Task {
  id: number;                                      // Auto-increment
  title: string;
  description: string | null;
  status: string;                                  // "todo", "in-progress", "done", etc.
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string | null;                      // Agent ID or null
  created_by: string;                              // Agent ID
  parent_id: number | null;                        // Parent task ID or null
  created_at: string;                              // ISO 8601 timestamp
  updated_at: string;                              // ISO 8601 timestamp
}
```

### TaskComment

```typescript
interface TaskComment {
  id: number;          // Auto-increment
  task_id: number;     // Parent task ID
  agent_id: string;    // Author agent ID
  content: string;     // Comment text
  created_at: string;  // ISO 8601 timestamp
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
  tasks: {
    total: number;
    todo: number;
    "in-progress": number;
    done: number;
  };
  context: number;
}
```

### `pm task show` (JSON)

When using `pm task show <id> --json`, the response includes a `comments` array:

```typescript
interface TaskWithComments extends Task {
  comments: TaskComment[];
}
```
