# Agent Onboarding Guide

A step-by-step checklist to get a brand-new AI agent productive in a `pm`-managed project. Follow these steps in order — you should be fully operational within 5 minutes.

---

## Prerequisites

Before starting, confirm:

- `pm` CLI is installed and on your `PATH` (run `pm --help` to verify)
- You have access to a project directory
- You have chosen an agent name and role

---

## Step 1: Check Project Status

Determine if the project is already initialized:

```bash
pm status --json
```

**Success response:**

```json
{
  "agents": 2,
  "tasks": { "total": 5, "todo": 3, "in-progress": 1, "done": 1 },
  "context": 4
}
```

**If the project is not initialized**, you'll get:

```
Error: Not a PM project. Run: pm init
```

Initialize first:

```bash
pm init
```

---

## Step 2: Register as an Agent

Register yourself with a unique name, role, and type:

```bash
pm agent register <your-name> --role developer --type ai --json
```

**Example:**

```bash
pm agent register atlas --role developer --type ai --json
```

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-03-01T09:00:00.000Z"
}
```

**If the name is already taken:**

```
Error: Agent 'atlas' already exists.
```

Use the existing agent or choose a different name.

> Always register with `--type ai` to distinguish yourself from human team members. Use a descriptive role: `developer`, `reviewer`, `pm`, `researcher`.

---

## Step 3: Set Your Identity

Set your identity for the session so every command is attributed to you:

```bash
export PM_AGENT=atlas
```

Alternatively, pass `--agent atlas` on every command. The env var is recommended to reduce repetition.

**Resolution priority:** `--agent` flag > `PM_AGENT` env var.

---

## Step 4: Verify Your Identity

Confirm your identity is active and correctly resolved:

```bash
pm agent whoami --json
```

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-03-01T09:00:00.000Z"
}
```

**If this fails**, check:
- `PM_AGENT` is set correctly (`echo $PM_AGENT`)
- The agent name matches a registered agent

---

## Step 5: Explore the Project

Get an overview of what's happening:

```bash
# Project summary
pm status --json

# All tasks
pm task list --json

# Who else is working
pm agent list --json

# Shared decisions, constraints, and notes
pm context list --json
```

Parse the JSON output to understand:
- How many tasks exist and their status distribution
- Which agents are active
- Key decisions or constraints recorded in context

---

## Step 6: Pick Your First Task

Find an unassigned task, claim it, and start working:

```bash
# 1. List available tasks
pm task list --status todo --json

# 2. Assign it to yourself
pm task assign <task-id> --to <your-name> --agent <your-name> --json

# 3. Move it to in-progress
pm task update <task-id> --status in-progress --agent <your-name> --json

# 4. Log what you're about to do
pm task comment <task-id> "Starting work on this task" --agent <your-name>
```

**Example:**

```bash
pm task list --status todo --json
pm task assign 3 --to atlas --agent atlas --json
pm task update 3 --status in-progress --agent atlas --json
pm task comment 3 "Starting implementation of input validation" --agent atlas
```

**How to pick a task:**

1. Filter for `assigned_to: null` (unassigned)
2. Sort by priority: `urgent` > `high` > `medium` > `low`
3. Pick the highest-priority task within your capability

---

## Quick Start Script

Complete onboarding in one block — copy and customize:

```bash
# Register (skip if already registered)
pm agent register my-agent --role developer --type ai --json

# Set identity
export PM_AGENT=my-agent

# Verify
pm agent whoami --json

# Explore
pm status --json
pm task list --json
pm agent list --json
pm context list --json

# Pick first task
pm task list --status todo --json
# pm task assign <id> --to my-agent --agent my-agent --json
# pm task update <id> --status in-progress --agent my-agent --json
```

---

## What's Next

After onboarding, refer to these guides for detailed workflows:

| Guide | Purpose |
|-------|---------|
| [CLI Reference](cli-reference.md) | All commands, flags, and JSON schemas |
| [Task Lifecycle](workflows/task-lifecycle.md) | Full task management workflow |
| [Context Sharing](workflows/context-sharing.md) | Share decisions and data with other agents |
| [Collaboration](workflows/collaboration.md) | Multi-agent coordination patterns |
| [Error Handling](error-handling.md) | Common errors and recovery strategies |

---

## Checklist Summary

- [ ] `pm status --json` — Project is initialized
- [ ] `pm agent register` — Agent registered with name, role, and type
- [ ] `export PM_AGENT=<name>` — Identity set for session
- [ ] `pm agent whoami --json` — Identity verified
- [ ] `pm status --json` / `pm task list --json` — Project explored
- [ ] `pm task assign` / `pm task update` — First task claimed and started
