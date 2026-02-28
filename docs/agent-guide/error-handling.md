# Error Handling Guide

How to detect, interpret, and recover from `pm` CLI errors. All error messages in this guide are derived from the actual source code.

---

## Error Format

All errors follow the same pattern:

- **Output**: `Error: <message>` printed to **stderr**
- **Exit code**: `1` (non-zero)
- **Successful commands**: exit code `0`

---

## Common Errors

### Identity Errors

| Error Message | Cause | Recovery |
|--------------|-------|----------|
| `Agent identity required. Use --agent <name> or set PM_AGENT env var.` | Command requires identity but none is set | `export PM_AGENT=<name>` or add `--agent <name>` |
| `Agent '<name>' not registered. Run: pm agent register <name>` | Identity is set but the agent name doesn't exist in the database | Register first: `pm agent register <name> --role developer --type ai --json` |

**Source:** `src/core/identity.ts` — `resolveIdentity()`

### Agent Errors

| Error Message | Cause | Recovery |
|--------------|-------|----------|
| `Agent '<name>' already exists.` | Trying to register a name that's taken | Use the existing agent or choose a different name |
| `Agent '<name>' not found` | Looking up an agent that doesn't exist | Check available agents: `pm agent list --json` |
| `Invalid agent type: '<type>'. Must be 'human' or 'ai'.` | `--type` flag has an invalid value | Use `--type ai` or `--type human` |

**Source:** `src/core/agent.ts` — `registerAgent()`, `src/cli/commands/agent.ts`

### Task Errors

| Error Message | Cause | Recovery |
|--------------|-------|----------|
| `Task #<id> not found.` | Task ID doesn't exist | List valid tasks: `pm task list --json` |
| `<Label> agent '<agentId>' not found.` | Creator or assignee agent doesn't exist in the database | Register the agent first, then retry |

**Source:** `src/core/task.ts` — `validateAgent()`, `validateTask()`

### Context Errors

| Error Message | Cause | Recovery |
|--------------|-------|----------|
| `Agent '<name>' not found.` | Agent referenced by `created_by` doesn't exist | Register the agent first |
| `Context key '<key>' not found.` | Looking up a key that doesn't exist | List available keys: `pm context list --json` |

**Source:** `src/core/context.ts`, `src/cli/commands/context.ts`

### Project Errors

| Error Message | Cause | Recovery |
|--------------|-------|----------|
| `Not a PM project. Run: pm init` | No `.pm/` directory found in current or parent directories | Run `pm init` in the project root |
| `Project already initialized. .pm/ directory already exists.` | Running `pm init` in an already-initialized project | No action needed — project is ready |

**Source:** `src/core/identity.ts` — `findProjectRoot()`, `src/core/init.ts`

---

## Error Detection Pattern

Always check the exit code after running a `pm` command:

### Bash

```bash
result=$(pm task list --json 2>&1)
exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "Command failed: $result"
  # Handle error based on message content
else
  echo "Success: $result"
  # Parse JSON normally
fi
```

### Programmatic (Node.js / child_process)

```javascript
const { execSync } = require('child_process');

try {
  const output = execSync('pm task list --json', { encoding: 'utf8' });
  const tasks = JSON.parse(output);
} catch (error) {
  // error.status = 1 (exit code)
  // error.stderr contains the error message
  console.error('PM command failed:', error.stderr);
}
```

---

## Recovery Strategies

### Identity Errors → Register + Set Environment

```bash
# Check if agent exists
pm agent show my-agent --json 2>&1
exit_code=$?

if [ $exit_code -ne 0 ]; then
  # Register if missing
  pm agent register my-agent --role developer --type ai --json
fi

# Set identity
export PM_AGENT=my-agent
pm agent whoami --json
```

### "Not Found" Errors → List Resources to Discover Valid IDs

```bash
# Task not found? List all tasks
pm task list --json

# Agent not found? List all agents
pm agent list --json

# Context key not found? List all context
pm context list --json
```

### Project Not Initialized → Initialize

```bash
# Check and initialize if needed
pm status --json 2>&1
exit_code=$?

if [ $exit_code -ne 0 ]; then
  pm init
fi
```

### Constraint Errors → Check Before Writing

```bash
# Before registering, check if agent exists
existing=$(pm agent show my-agent --json 2>&1)
exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "Agent already exists, skipping registration"
else
  pm agent register my-agent --role developer --type ai --json
fi
```

---

## Defensive Coding Patterns

### 1. Verify Identity Before Starting a Work Session

```bash
# First command in any session — fail fast if identity is broken
pm agent whoami --json 2>&1
if [ $? -ne 0 ]; then
  echo "Identity not set. Aborting."
  exit 1
fi
```

### 2. Use `pm status` as a Health Check

```bash
# Confirms project exists, database is accessible
pm status --json 2>&1
if [ $? -ne 0 ]; then
  echo "Project not healthy. Check .pm/ directory."
  exit 1
fi
```

### 3. Parse JSON with Error Handling

```bash
result=$(pm task list --json 2>&1)
if [ $? -ne 0 ]; then
  echo "Failed to list tasks: $result"
  exit 1
fi

# Safe to parse JSON now
echo "$result" | jq '.[0].id'
```

### 4. Wrap Multi-Step Operations

```bash
# Claim and start a task — abort if any step fails
set -e

pm task assign "$TASK_ID" --to "$MY_NAME" --agent "$MY_NAME" --json
pm task update "$TASK_ID" --status in-progress --agent "$MY_NAME" --json
pm task comment "$TASK_ID" "Starting work" --agent "$MY_NAME"

set +e
```

---

## Error Reference by Command

Quick lookup of which errors each command can produce:

| Command | Possible Errors |
|---------|----------------|
| `pm init` | `Project already initialized` |
| `pm status` | `Not a PM project` |
| `pm agent register` | `Agent already exists`, `Invalid agent type` |
| `pm agent show` | `Agent not found` |
| `pm agent whoami` | `Agent identity required`, `Agent not registered` |
| `pm agent list` | (no command-specific errors) |
| `pm task add` | `Agent identity required`, `Agent not registered` |
| `pm task list` | `Agent not found` (if `--assigned` filter references unknown agent) |
| `pm task show` | `Task not found` |
| `pm task update` | `Agent identity required`, `Agent not registered`, `Task not found` |
| `pm task assign` | `Agent identity required`, `Agent not registered`, `Agent not found` (assignee) |
| `pm task comment` | `Agent identity required`, `Agent not registered`, `Task not found` |
| `pm context set` | `Agent identity required`, `Agent not found` |
| `pm context get` | `Context key not found` |
| `pm context list` | (no command-specific errors) |
| `pm context search` | (no command-specific errors) |
