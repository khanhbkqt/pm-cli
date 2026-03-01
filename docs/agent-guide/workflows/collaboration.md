# Multi-Agent Collaboration Patterns

How multiple AI agents coordinate work using `pm` — plan management, handoffs, shared decisions, and work decomposition.

## Overview

Agents collaborate through two channels:

- **Plans** — Create work items, track status via transitions, coordinate execution
- **Context** — Share decisions, constraints, and project-wide state

No direct agent-to-agent communication exists. All coordination happens through these shared data stores, which means every action is visible, auditable, and persistent.

---

## Pattern 1: Work Handoff via Plans

One agent creates a plan and another agent picks it up.

### Agent A: Create Work

```bash
# Agent A creates a plan for a review phase
pm plan create "Review authentication implementation" \
  --phase <phase-id> --number 3 --wave 1 \
  --content "Review JWT middleware in src/auth/ for security issues" \
  --agent agent-a
```

```bash
# Leave context about what to review
pm context set "plan-3:review-focus" \
  "Focus on: token expiry handling, error responses for invalid tokens, CORS configuration" \
  --category note --agent agent-a
```

### Agent B: Pick Up and Complete

```bash
# Agent B checks for pending plans
pm plan list --phase <phase-id> --status pending --json --agent agent-b
```

```bash
# Start work
pm plan update <plan-id> --status in_progress --agent agent-b

# Review and report findings via context
pm context set "plan-3:findings" \
  "Found 2 issues: (1) Token expiry not checked on refresh, (2) CORS allows wildcard in production config" \
  --category note --agent agent-b

# Mark done
pm plan update <plan-id> --status completed --agent agent-b
```

### Agent A: Check Results

```bash
# Agent A checks findings
pm context search "plan-3" --json --agent agent-a
```

The context entries contain Agent B's findings. Agent A can now act on them.

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
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
]
```

A decision already exists — Agent C must use SQLite with WAL mode.

### Proposing a Change

If you disagree with an existing decision, don't overwrite it. Record it for discussion:

```bash
pm context set "proposal:db-change" \
  "Propose switching from SQLite to PostgreSQL for production — SQLite may not scale for concurrent multi-agent writes" \
  --category note --agent agent-c
```

---

## Pattern 3: Status Broadcasting

Use context to broadcast project-wide state.

### Broadcasting via Context

```bash
# Agent A starts a deployment
pm context set "deploy-status" "deploying-to-staging" --category note --agent agent-a

# Other agents check before doing risky operations
pm context get "deploy-status" --json
# If "deploying-to-staging" → avoid database migrations

# Agent A finishes deployment
pm context set "deploy-status" "staging-live" --category note --agent agent-a
```

### Broadcasting via Plan Context

For plan-specific updates, use namespaced context entries:

```bash
# Agent A hits a roadblock on their plan
pm context set "plan-5:warning" \
  "The auth module has a circular dependency with the user module. All agents working on either module should be aware." \
  --category note --agent agent-a
```

---

## Pattern 4: Work Decomposition via Plans

Break large work into smaller plans assigned to waves.

### Orchestrator Creates Plans

```bash
# Phase: "Build user management system"
# Create plans within the phase
pm plan create "Implement user registration" \
  --phase <phase-id> --number 1 --wave 1 --agent orchestrator

pm plan create "Implement user login" \
  --phase <phase-id> --number 2 --wave 1 --agent orchestrator

pm plan create "Write user management tests" \
  --phase <phase-id> --number 3 --wave 2 --agent orchestrator
```

### Monitor Progress

```bash
# Check all plans in the phase
pm plan list --phase <phase-id> --json --agent orchestrator
pm progress
```

When all plans are `completed`, the phase auto-transitions to `completed`.

---

## Anti-Patterns

### ❌ Don't: Overwrite Context Without Checking

```bash
# BAD: Agent overrides database decision without checking
pm context set "db-config" '{"engine":"postgres"}' --category decision
```

**Instead:** Search first, and if a decision exists, create a proposal.

### ❌ Don't: Work Without Identity

```bash
# BAD: Forgetting --agent flag
pm plan update 3 --status completed
# Error: Agent identity required.
```

**Instead:** Always include `--agent <name>` on every command, or set `PM_AGENT` environment variable.

### ❌ Don't: Silent Status Changes

```bash
# BAD: Changing status without context
pm plan update 3 --status completed --agent atlas
```

**Instead:** Pair status changes with context explaining what happened:

```bash
pm plan update 3 --status completed --agent atlas
pm context set "plan-3:result" "Added validation for all 5 endpoints, 12 test cases pass" --category note --agent atlas
```
