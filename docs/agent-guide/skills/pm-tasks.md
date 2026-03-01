---
description: PM Tasks - How to add, assign, and update tasks/subtasks
---

# PM Task Management

## Task Lifecycle

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

## Task Commands

### Create a new task

**Requires identity.**

```bash
pm task add <title> [options]
```

| Flag                   | Required | Description                       |
| ---------------------- | -------- | --------------------------------- |
| `--description <desc>` | No       | Task description                  |
| `--priority <p>`       | No       | `low`, `medium`, `high`, `urgent` |
| `--parent <id>`        | No       | Parent task ID (creates subtask)  |

```json
{
  "id": 1,
  "title": "Implement feature X",
  "status": "todo",
  "priority": "high",
  "assigned_to": null,
  "parent_id": null
}
```

### List tasks

List tasks with optional filters. Returns `Task[]`.

```bash
pm task list [options]
```

| Flag                 | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `--status <status>`  | Filter: `todo`, `in-progress`, `done`, `blocked`, `review` |
| `--assigned <agent>` | Filter by assigned agent name                              |
| `--parent <id>`      | Filter by parent task ID                                   |

### Read, Update, Comment

- **Read:** `pm task show <id>` (includes comments)
- **Update:** `pm task update <id> --status <status> --title <t>`
- **Assign:** `pm task assign <id> --to <agent-name>`
- **Comment:** `pm task comment <id> <message>`
