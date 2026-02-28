# Multi-Agent Collaboration Patterns

How multiple AI agents coordinate work using `pm` — task assignment, handoffs, shared decisions, and subtask decomposition.

## Overview

Agents collaborate through two channels:

- **Tasks** — Assign work, track status, exchange updates via comments
- **Context** — Share decisions, constraints, and project-wide state

No direct agent-to-agent communication exists. All coordination happens through these shared data stores, which means every action is visible, auditable, and persistent.

---

## Pattern 1: Task Handoff

One agent creates work and assigns it to another.

### Agent A: Create and Assign

```bash
# Agent A creates a task for Agent B
pm task add "Review authentication implementation" \
  --description "Review JWT middleware in src/auth/ for security issues" \
  --priority high \
  --agent agent-a --json
```

```json
{
  "id": 10,
  "title": "Review authentication implementation",
  "description": "Review JWT middleware in src/auth/ for security issues",
  "status": "todo",
  "priority": "high",
  "assigned_to": null,
  "created_by": "aaaa-bbbb-cccc-dddd",
  "parent_id": null,
  "created_at": "2026-03-01T10:00:00.000Z",
  "updated_at": "2026-03-01T10:00:00.000Z"
}
```

```bash
# Assign to Agent B
pm task assign 10 --to agent-b --agent agent-a --json
```

```bash
# Leave context about what to review
pm task comment 10 "Focus on: token expiry handling, error responses for invalid tokens, and CORS configuration" --agent agent-a
```

### Agent B: Pick Up and Complete

```bash
# Agent B sees the assignment
pm task list --assigned agent-b --status todo --json --agent agent-b
```

```json
[
  {
    "id": 10,
    "title": "Review authentication implementation",
    "status": "todo",
    "priority": "high",
    "assigned_to": "eeee-ffff-0000-1111",
    "created_by": "aaaa-bbbb-cccc-dddd",
    "parent_id": null,
    "created_at": "2026-03-01T10:00:00.000Z",
    "updated_at": "2026-03-01T10:05:00.000Z"
  }
]
```

```bash
# Start work
pm task update 10 --status in-progress --agent agent-b --json

# Review and report findings
pm task comment 10 "Review complete. Found 2 issues: (1) Token expiry not checked on refresh, (2) CORS allows wildcard in production config" --agent agent-b

# Mark done
pm task update 10 --status done --agent agent-b --json
```

### Agent A: Check Results

```bash
# Agent A checks the review task
pm task show 10 --json --agent agent-a
```

The comments contain Agent B's findings. Agent A can now act on them.

---

## Pattern 2: Shared Decisions

Before making a decision, check if one already exists to avoid conflicts.

### Check Before Deciding

```bash
# Agent B wants to pick a testing framework
pm context search "test" --json --agent agent-b
```

```json
[]
```

Empty result — no testing decision made yet. Safe to decide:

```bash
pm context set "test-framework" "vitest" --category decision --agent agent-b --json
```

```json
{
  "id": 5,
  "key": "test-framework",
  "value": "vitest",
  "category": "decision",
  "created_by": "eeee-ffff-0000-1111",
  "created_at": "2026-03-01T11:00:00.000Z",
  "updated_at": "2026-03-01T11:00:00.000Z"
}
```

### Respect Existing Decisions

```bash
# Agent C wants to pick a database
pm context search "db" --json --agent agent-c
```

```json
[
  {
    "id": 2,
    "key": "db-config",
    "value": "{\"engine\":\"sqlite\",\"mode\":\"wal\",\"path\":\"data.db\"}",
    "category": "decision",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:05:00.000Z",
    "updated_at": "2026-03-01T09:05:00.000Z"
  }
]
```

A decision already exists — Agent C must use SQLite with WAL mode, not pick a different database.

### Proposing a Change

If you disagree with an existing decision, don't overwrite it silently. Create a task:

```bash
pm task add "Reconsider database choice: evaluate PostgreSQL for production" \
  --description "SQLite may not scale for concurrent multi-agent writes. Propose switching to PostgreSQL." \
  --priority medium \
  --agent agent-c --json
```

---

## Pattern 3: Status Broadcasting

Use context and comments to broadcast project-wide state.

### Broadcasting via Context

```bash
# Agent A starts a deployment
pm context set "deploy-status" "deploying-to-staging" --category note --agent agent-a --json

# Other agents check before doing risky operations
pm context get "deploy-status" --json
# If "deploying-to-staging" → avoid database migrations

# Agent A finishes deployment
pm context set "deploy-status" "staging-live" --category note --agent agent-a --json
```

### Broadcasting via Task Comments

For task-specific updates, use comments so all watchers of that task stay informed:

```bash
# Agent A hits a roadblock on task #5
pm task comment 5 "Warning: the auth module has a circular dependency with the user module. All agents working on either module should be aware." --agent agent-a
```

Any agent checking task #5 with `pm task show 5 --json` will see this warning.

---

## Pattern 4: Subtask Decomposition

Break large tasks into smaller subtasks assigned to different agents.

### Orchestrator Creates Subtasks

```bash
# Parent task exists: #1 "Build user management system"

# Create subtasks under it
pm task add "Implement user registration endpoint" \
  --parent 1 --priority high --agent orchestrator --json
```

```json
{
  "id": 11,
  "title": "Implement user registration endpoint",
  "status": "todo",
  "priority": "high",
  "assigned_to": null,
  "created_by": "aaaa-bbbb-cccc-dddd",
  "parent_id": 1,
  "created_at": "2026-03-01T12:00:00.000Z",
  "updated_at": "2026-03-01T12:00:00.000Z"
}
```

```bash
pm task add "Implement user login endpoint" \
  --parent 1 --priority high --agent orchestrator --json

pm task add "Write user management tests" \
  --parent 1 --priority medium --agent orchestrator --json

# Assign to different agents
pm task assign 11 --to agent-a --agent orchestrator --json
pm task assign 12 --to agent-b --agent orchestrator --json
pm task assign 13 --to agent-c --agent orchestrator --json
```

### Monitor Subtask Progress

```bash
# Check all subtasks of task #1
pm task list --parent 1 --json --agent orchestrator
```

```json
[
  {
    "id": 11,
    "title": "Implement user registration endpoint",
    "status": "in-progress",
    "priority": "high",
    "assigned_to": "aaaa-bbbb-cccc-dddd",
    "parent_id": 1
  },
  {
    "id": 12,
    "title": "Implement user login endpoint",
    "status": "done",
    "priority": "high",
    "assigned_to": "eeee-ffff-0000-1111",
    "parent_id": 1
  },
  {
    "id": 13,
    "title": "Write user management tests",
    "status": "todo",
    "priority": "medium",
    "assigned_to": "2222-3333-4444-5555",
    "parent_id": 1
  }
]
```

When all subtasks are `done`, mark the parent task done:

```bash
pm task update 1 --status done --agent orchestrator --json
pm task comment 1 "All subtasks complete. User management system ready." --agent orchestrator
```

---

## Anti-Patterns

### ❌ Don't: Overwrite Context Without Checking

```bash
# BAD: Agent overrides database decision without checking
pm context set "db-config" '{"engine":"postgres"}' --category decision --agent agent-c --json
```

**Instead:** Search first, and if a decision exists, create a discussion task.

### ❌ Don't: Poll Aggressively

```bash
# BAD: Tight loop checking if another agent finished
while true; do
  pm task show 10 --json --agent agent-a
  sleep 1
done
```

**Instead:** Check at logical checkpoints — after completing your own subtask, after a major work phase, or when you need the result to continue.

### ❌ Don't: Rely on File-System Locks

```bash
# BAD: Using lockfiles for coordination
touch /tmp/deploy.lock
# ... deploy ...
rm /tmp/deploy.lock
```

**Instead:** Use `pm context set "deploy-status" "in-progress"` — it's visible to all agents and persisted.

### ❌ Don't: Work Without Identity

```bash
# BAD: Forgetting --agent flag
pm task update 3 --status done
# Error: Agent identity required.
```

**Instead:** Always include `--agent <name>` on every command.

### ❌ Don't: Silent Status Changes

```bash
# BAD: Changing status without explanation
pm task update 3 --status done --agent atlas --json
```

**Instead:** Always pair status changes with a comment explaining what happened:

```bash
pm task update 3 --status done --agent atlas --json
pm task comment 3 "Completed: added validation for all 5 endpoints, 12 test cases pass" --agent atlas
```
