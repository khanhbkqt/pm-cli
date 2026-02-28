<!-- version: 1.0.0 -->
# PM CLI Agent Instructions

You are an AI coding agent working in a project managed by `pm` — a CLI tool for multi-agent project management. This document is your complete reference for using `pm` effectively.

**Core principle:** Always use `--json` for machine-readable output. Always set agent identity before running commands.

---

## Quick Start

Get productive in 5 commands:

```bash
# 1. Initialize project (skip if already initialized)
pm init

# 2. Register yourself
pm agent register <your-name> --role developer --type ai --json

# 3. Set identity for the session
export PM_AGENT=<your-name>

# 4. Verify identity
pm agent whoami --json

# 5. Check project status
pm status --json
```

---

## Identity

Every `pm` action is attributed to an agent. You must set identity before creating or modifying data.

### Register

```bash
pm agent register <name> --role <role> --type ai --json
```

| Flag | Required | Values |
|------|----------|--------|
| `--role` | Yes | `developer`, `reviewer`, `pm`, `researcher` |
| `--type` | Yes | `ai` or `human` (always use `ai`) |

### Set Identity

Two methods (in priority order):

| Method | Scope | Example |
|--------|-------|---------|
| `--agent <name>` flag | Per-command | `pm task list --agent atlas --json` |
| `PM_AGENT` env var | Session-wide | `export PM_AGENT=atlas` |

**Recommended:** Set `PM_AGENT` at session start. The `--agent` flag overrides the env var if both are set.

### Verify

```bash
pm agent whoami --json
```

Always run this before starting work to confirm identity is active.

---

## Command Reference

### Global Options

| Option | Description |
|--------|-------------|
| `--agent <name>` | Set agent identity for this command |
| `--json` | Output machine-readable JSON |

---

### Project Commands

#### `pm init [name]`

Initialize a new PM project. Creates `.pm/` directory with database and config.

```bash
pm init my-project
```

> Note: `pm init` does not support `--json`. Always outputs human-readable text.

#### `pm status`

Show project overview.

```bash
pm status --json
```

```json
{
  "agents": 3,
  "tasks": { "total": 12, "todo": 4, "in-progress": 3, "done": 5 },
  "context": 8
}
```

#### `pm dashboard [--port <n>] [--no-open]`

Launch web dashboard. Long-running command — agents typically don't need this. Use CLI + `--json` instead.

---

### Agent Commands

#### `pm agent register <name> --role <role> --type <type>`

Register a new agent. Returns agent object with UUID.

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-02-28T14:30:00.000Z"
}
```

#### `pm agent list`

List all registered agents. Returns `Agent[]`.

#### `pm agent show <name>`

Show details of a specific agent. Returns `Agent`.

#### `pm agent whoami`

Show current agent identity. Requires identity to be set. Returns `Agent`.

---

### Task Commands

#### `pm task add <title> [options]`

Create a new task. **Requires identity.**

| Flag | Required | Description |
|------|----------|-------------|
| `--description <desc>` | No | Task description |
| `--priority <p>` | No | `low`, `medium`, `high`, `urgent` |
| `--parent <id>` | No | Parent task ID (creates subtask) |

```json
{
  "id": 1,
  "title": "Implement feature X",
  "description": "Details here",
  "status": "todo",
  "priority": "high",
  "assigned_to": null,
  "created_by": "a1b2c3d4-...",
  "parent_id": null,
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T14:30:00.000Z"
}
```

#### `pm task list [options]`

List tasks with optional filters.

| Flag | Description |
|------|-------------|
| `--status <status>` | Filter: `todo`, `in-progress`, `done`, `blocked`, `review` |
| `--assigned <agent>` | Filter by assigned agent name |
| `--parent <id>` | Filter by parent task ID |

Returns `Task[]`.

#### `pm task show <id>`

Show task details including comments. Returns `Task` with `comments: TaskComment[]`.

#### `pm task update <id> [options]`

Update task fields. **Requires identity.**

| Flag | Description |
|------|-------------|
| `--title <title>` | New title |
| `--description <desc>` | New description |
| `--status <status>` | `todo`, `in-progress`, `done`, `blocked`, `review` |
| `--priority <p>` | `low`, `medium`, `high`, `urgent` |

#### `pm task assign <id> --to <agent>`

Assign task to an agent. **Requires identity.**

#### `pm task comment <id> <message>`

Add a comment to a task. **Requires identity.**

```json
{
  "id": 1,
  "task_id": 1,
  "agent_id": "a1b2c3d4-...",
  "content": "Comment text here",
  "created_at": "2026-02-28T16:30:00.000Z"
}
```

---

### Context Commands

Context is a persistent key-value store for sharing decisions, specs, notes, and constraints across agents.

#### `pm context set <key> <value> [--category <cat>]`

Set a context entry. **Requires identity.**

| Category | Purpose |
|----------|---------|
| `decision` | Architectural/design choices |
| `spec` | Requirements and specifications |
| `note` | General information (default) |
| `constraint` | Limitations and rules |

```json
{
  "id": 1,
  "key": "api-version",
  "value": "v2",
  "category": "decision",
  "created_by": "a1b2c3d4-...",
  "created_at": "2026-02-28T14:30:00.000Z",
  "updated_at": "2026-02-28T14:30:00.000Z"
}
```

> Setting an existing key overwrites it. Check before writing.

#### `pm context get <key>`

Get a context entry by key. Returns `ContextEntry`.

#### `pm context list [--category <cat>]`

List all context entries, optionally filtered by category. Returns `ContextEntry[]`.

#### `pm context search <query>`

Search context by key or value substring. Returns `ContextEntry[]`.

---

## JSON Output Schemas

All `--json` output conforms to these TypeScript interfaces:

```typescript
interface Agent {
  id: string;          // UUID
  name: string;        // Unique agent name
  role: string;        // e.g. "developer", "reviewer"
  type: "human" | "ai";
  created_at: string;  // ISO 8601
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;      // "todo" | "in-progress" | "done" | "blocked" | "review"
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to: string | null;  // Agent ID
  created_by: string;          // Agent ID
  parent_id: number | null;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}

interface TaskComment {
  id: number;
  task_id: number;
  agent_id: string;    // Author agent ID
  content: string;
  created_at: string;  // ISO 8601
}

interface ContextEntry {
  id: number;
  key: string;
  value: string;
  category: "decision" | "spec" | "note" | "constraint";
  created_by: string;  // Agent ID
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}

interface Status {
  agents: number;
  tasks: { total: number; todo: number; "in-progress": number; done: number; };
  context: number;
}

// pm task show --json includes comments
interface TaskWithComments extends Task {
  comments: TaskComment[];
}
```

---

## Workflows

### Task Lifecycle

The standard flow for working on a task:

```
todo → in-progress → done
         ↓
       blocked → in-progress → done
```

**Step-by-step:**

1. **Find tasks:** `pm task list --status todo --json`
2. **Pick:** Filter `assigned_to: null`, sort by priority (`urgent > high > medium > low`)
3. **Claim:** `pm task assign <id> --to <your-name> --json`
4. **Start:** `pm task update <id> --status in-progress --json`
5. **Log:** `pm task comment <id> "Starting work on..." `
6. **Progress:** Add comments as you complete sub-parts
7. **Complete:** `pm task update <id> --status done --json`
8. **Summarize:** `pm task comment <id> "Done. Changes: ..." `

**If blocked:**

```bash
pm task update <id> --status blocked --json
pm task comment <id> "Blocked: waiting for task #N to complete"
```

**Creating subtasks:**

```bash
pm task add "Subtask title" --parent <parent-id> --priority high --json
```

### Context Sharing

Share decisions and data with other agents:

1. **Check first:** `pm context search "<topic>" --json` — avoid overwriting existing decisions
2. **Set:** `pm context set "<key>" "<value>" --category decision --json`
3. **Read:** `pm context get "<key>" --json`
4. **Browse:** `pm context list --category decision --json` — see all decisions

**Key naming:** Use kebab-case (`api-base-url`, `db-engine`, `auth-method`).

**Complex values:** Serialize as JSON strings:

```bash
pm context set "db-config" '{"engine":"sqlite","mode":"wal"}' --category decision --json
```

---

## Collaboration

### Task Handoff

```bash
# Agent A creates and assigns to Agent B
pm task add "Review auth implementation" --priority high --json
pm task assign <id> --to agent-b --json
pm task comment <id> "Focus on: token expiry, error responses, CORS" 

# Agent B picks up
pm task list --assigned agent-b --status todo --json
pm task update <id> --status in-progress --json
# ... do work, add comments ...
pm task update <id> --status done --json
```

### Shared Decisions

```bash
# Always check before deciding
pm context search "test" --json
# If empty → safe to decide
pm context set "test-framework" "vitest" --category decision --json
# If exists → respect it or create a discussion task
```

### Subtask Decomposition

```bash
# Create subtasks under a parent
pm task add "Implement registration" --parent 1 --priority high --json
pm task add "Implement login" --parent 1 --priority high --json
pm task add "Write tests" --parent 1 --priority medium --json

# Assign to different agents
pm task assign 11 --to agent-a --json
pm task assign 12 --to agent-b --json

# Monitor via parent filter
pm task list --parent 1 --json
```

---

## Error Recovery

### Error Format

All errors: `Error: <message>` on stderr, exit code `1`. Success: exit code `0`.

### Common Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| `Agent identity required. Use --agent <name> or set PM_AGENT env var.` | No identity set | `export PM_AGENT=<name>` |
| `Agent '<name>' not registered. Run: pm agent register <name>` | Identity set but agent doesn't exist | `pm agent register <name> --role developer --type ai --json` |
| `Agent '<name>' already exists.` | Duplicate registration | Use existing agent or different name |
| `Agent '<name>' not found` | Looking up nonexistent agent | `pm agent list --json` to see valid agents |
| `Invalid agent type: '<type>'. Must be 'human' or 'ai'.` | Bad `--type` value | Use `--type ai` |
| `Task #<id> not found.` | Invalid task ID | `pm task list --json` to see valid IDs |
| `Context key '<key>' not found.` | Looking up nonexistent key | `pm context list --json` to see valid keys |
| `Not a PM project. Run: pm init` | No `.pm/` directory | `pm init` in project root |
| `Project already initialized.` | Re-running init | No action needed |

### Error Detection Pattern

```bash
result=$(pm task list --json 2>&1)
exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "Failed: $result"
  # Inspect message and recover
else
  # Parse JSON safely
  echo "$result" | jq '.'
fi
```

### Defensive Patterns

```bash
# 1. Always verify identity first
pm agent whoami --json 2>&1 || { echo "Identity not set"; exit 1; }

# 2. Use pm status as health check
pm status --json 2>&1 || { echo "Project not healthy"; exit 1; }

# 3. Check before registering
pm agent show my-agent --json 2>&1 || pm agent register my-agent --role developer --type ai --json

# 4. Wrap multi-step operations
set -e
pm task assign "$ID" --to "$ME" --json
pm task update "$ID" --status in-progress --json
pm task comment "$ID" "Starting work"
set +e
```

### Error Reference by Command

| Command | Possible Errors |
|---------|----------------|
| `pm init` | `Project already initialized` |
| `pm status` | `Not a PM project` |
| `pm agent register` | `Agent already exists`, `Invalid agent type` |
| `pm agent show` | `Agent not found` |
| `pm agent whoami` | `Agent identity required`, `Agent not registered` |
| `pm agent list` | _(none)_ |
| `pm task add` | `Agent identity required`, `Agent not registered` |
| `pm task list` | `Agent not found` (if `--assigned` filter invalid) |
| `pm task show` | `Task not found` |
| `pm task update` | `Agent identity required`, `Agent not registered`, `Task not found` |
| `pm task assign` | `Agent identity required`, `Agent not registered`, `Agent not found` |
| `pm task comment` | `Agent identity required`, `Agent not registered`, `Task not found` |
| `pm context set` | `Agent identity required`, `Agent not found` |
| `pm context get` | `Context key not found` |
| `pm context list` | _(none)_ |
| `pm context search` | _(none)_ |

---

## Best Practices

1. **Always use `--json`** — Parse structured output, not human-readable text
2. **Set `PM_AGENT` at session start** — Avoid repeating `--agent` on every command
3. **Verify identity with `whoami`** — First command in any session
4. **Comment every status change** — Other agents rely on comments for context
5. **Be specific in comments** — Name files, functions, and decisions — not just "done"
6. **Check before deciding** — `pm context search` or `pm context list --category decision` before setting decisions
7. **Use subtasks for large work** — `--parent` decomposes complex tasks
8. **One task at a time** — Finish or block before picking up another
9. **Respect existing decisions** — If a context entry exists, don't overwrite without discussion
10. **Use kebab-case for context keys** — Consistent naming enables reliable searching
