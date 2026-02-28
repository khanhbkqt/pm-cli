# Task Lifecycle Workflow

How an AI agent manages tasks from creation through completion using `pm`.

## Task States

```
todo → in-progress → done
         ↓
       blocked → in-progress → done
         ↓
       review → done
```

Every task starts as `todo`. You move it through states as work progresses. The typical path is `todo → in-progress → done`, but tasks can also be `blocked` or sent to `review`.

---

## Step 1: Find Available Tasks

List unassigned tasks waiting for work:

```bash
pm task list --status todo --json --agent atlas
```

```json
[
  {
    "id": 3,
    "title": "Add input validation to API endpoints",
    "description": "Validate request bodies for POST/PUT endpoints",
    "status": "todo",
    "priority": "high",
    "assigned_to": null,
    "created_by": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "parent_id": null,
    "created_at": "2026-03-01T08:00:00.000Z",
    "updated_at": "2026-03-01T08:00:00.000Z"
  },
  {
    "id": 5,
    "title": "Write unit tests for auth module",
    "description": null,
    "status": "todo",
    "priority": "medium",
    "assigned_to": null,
    "created_by": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "parent_id": null,
    "created_at": "2026-03-01T08:30:00.000Z",
    "updated_at": "2026-03-01T08:30:00.000Z"
  }
]
```

**How to pick a task:**

1. Parse the JSON array
2. Filter for `assigned_to: null` (unassigned)
3. Sort by priority (`urgent` > `high` > `medium` > `low`)
4. Pick the highest-priority task you can handle

---

## Step 2: Claim the Task

Assign the task to yourself:

```bash
pm task assign 3 --to atlas --agent atlas --json
```

```json
{
  "id": 3,
  "title": "Add input validation to API endpoints",
  "description": "Validate request bodies for POST/PUT endpoints",
  "status": "todo",
  "priority": "high",
  "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_by": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "parent_id": null,
  "created_at": "2026-03-01T08:00:00.000Z",
  "updated_at": "2026-03-01T09:00:00.000Z"
}
```

The `assigned_to` field now contains your agent ID. Other agents can see this task is taken.

---

## Step 3: Start Work

Move the task to `in-progress` and log what you're doing:

```bash
pm task update 3 --status in-progress --agent atlas --json
```

```json
{
  "id": 3,
  "title": "Add input validation to API endpoints",
  "description": "Validate request bodies for POST/PUT endpoints",
  "status": "in-progress",
  "priority": "high",
  "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_by": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "parent_id": null,
  "created_at": "2026-03-01T08:00:00.000Z",
  "updated_at": "2026-03-01T09:05:00.000Z"
}
```

Add a comment describing your plan:

```bash
pm task comment 3 "Starting implementation: will add zod schemas for POST /tasks and PUT /tasks/:id request bodies" --agent atlas
```

```json
{
  "id": 1,
  "task_id": 3,
  "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Starting implementation: will add zod schemas for POST /tasks and PUT /tasks/:id request bodies",
  "created_at": "2026-03-01T09:05:30.000Z"
}
```

---

## Step 4: Report Progress

As you complete sub-parts of the work, log progress via comments:

```bash
pm task comment 3 "Completed validation for POST /tasks — schema rejects missing title and invalid priority values" --agent atlas
```

```json
{
  "id": 2,
  "task_id": 3,
  "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Completed validation for POST /tasks — schema rejects missing title and invalid priority values",
  "created_at": "2026-03-01T09:30:00.000Z"
}
```

```bash
pm task comment 3 "Completed validation for PUT /tasks/:id — partial updates supported, invalid fields rejected" --agent atlas
```

```json
{
  "id": 3,
  "task_id": 3,
  "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Completed validation for PUT /tasks/:id — partial updates supported, invalid fields rejected",
  "created_at": "2026-03-01T10:00:00.000Z"
}
```

**Tips for progress comments:**
- Be specific about what was done, not just "making progress"
- Include file names or function names when relevant
- Mention blockers immediately so other agents can help

---

## Step 5: Complete the Task

Mark the task as done and leave a summary comment:

```bash
pm task update 3 --status done --agent atlas --json
```

```json
{
  "id": 3,
  "title": "Add input validation to API endpoints",
  "description": "Validate request bodies for POST/PUT endpoints",
  "status": "done",
  "priority": "high",
  "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_by": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "parent_id": null,
  "created_at": "2026-03-01T08:00:00.000Z",
  "updated_at": "2026-03-01T10:15:00.000Z"
}
```

```bash
pm task comment 3 "Task completed. Added zod validation schemas for POST /tasks and PUT /tasks/:id. Changes in src/api/validators.ts and src/api/routes/tasks.ts" --agent atlas
```

```json
{
  "id": 4,
  "task_id": 3,
  "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "content": "Task completed. Added zod validation schemas for POST /tasks and PUT /tasks/:id. Changes in src/api/validators.ts and src/api/routes/tasks.ts",
  "created_at": "2026-03-01T10:15:30.000Z"
}
```

---

## Complete Flow Example

Full script showing an agent picking up task #3 and completing it:

```bash
# 1. Verify identity
pm agent whoami --agent atlas --json

# 2. Find available tasks
pm task list --status todo --json --agent atlas

# 3. Claim a task
pm task assign 3 --to atlas --agent atlas --json

# 4. Start work
pm task update 3 --status in-progress --agent atlas --json
pm task comment 3 "Starting implementation of input validation" --agent atlas

# 5. Do the actual work (code changes, tests, etc.)
# ... your implementation here ...

# 6. Report progress
pm task comment 3 "Completed POST validation, moving to PUT endpoint" --agent atlas

# 7. More work
# ... continue implementation ...

# 8. Complete
pm task update 3 --status done --agent atlas --json
pm task comment 3 "Done. Validation added for all endpoints. Files changed: src/api/validators.ts, src/api/routes/tasks.ts" --agent atlas
```

---

## Handling Blocked Tasks

If you hit a blocker that prevents progress:

```bash
pm task update 3 --status blocked --agent atlas --json
pm task comment 3 "Blocked: waiting for database schema migration in task #2 to complete before adding constraints" --agent atlas
```

When the blocker resolves, resume:

```bash
pm task update 3 --status in-progress --agent atlas --json
pm task comment 3 "Unblocked: schema migration complete, resuming validation work" --agent atlas
```

---

## Creating New Tasks

If you discover work that needs doing:

```bash
pm task add "Add rate limiting to API" --description "Prevent abuse with per-agent rate limits" --priority medium --agent atlas --json
```

```json
{
  "id": 6,
  "title": "Add rate limiting to API",
  "description": "Prevent abuse with per-agent rate limits",
  "status": "todo",
  "priority": "medium",
  "assigned_to": null,
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent_id": null,
  "created_at": "2026-03-01T10:30:00.000Z",
  "updated_at": "2026-03-01T10:30:00.000Z"
}
```

### Creating Subtasks

Break down large tasks with `--parent`:

```bash
pm task add "Validate POST /tasks body" --parent 3 --priority high --agent atlas --json
```

```json
{
  "id": 7,
  "title": "Validate POST /tasks body",
  "description": null,
  "status": "todo",
  "priority": "high",
  "assigned_to": null,
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "parent_id": 3,
  "created_at": "2026-03-01T10:35:00.000Z",
  "updated_at": "2026-03-01T10:35:00.000Z"
}
```

### Checking Task Details

View full task details including all comments:

```bash
pm task show 3 --json --agent atlas
```

```json
{
  "id": 3,
  "title": "Add input validation to API endpoints",
  "description": "Validate request bodies for POST/PUT endpoints",
  "status": "done",
  "priority": "high",
  "assigned_to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_by": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "parent_id": null,
  "created_at": "2026-03-01T08:00:00.000Z",
  "updated_at": "2026-03-01T10:15:00.000Z",
  "comments": [
    {
      "id": 1,
      "task_id": 3,
      "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "content": "Starting implementation: will add zod schemas for POST /tasks and PUT /tasks/:id request bodies",
      "created_at": "2026-03-01T09:05:30.000Z"
    },
    {
      "id": 4,
      "task_id": 3,
      "agent_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "content": "Task completed. Added zod validation schemas for POST /tasks and PUT /tasks/:id. Changes in src/api/validators.ts and src/api/routes/tasks.ts",
      "created_at": "2026-03-01T10:15:30.000Z"
    }
  ]
}
```

---

## Best Practices

1. **Always use `--agent`** — Include the `--agent <name>` flag on every command for clarity
2. **Comment early, comment often** — Other agents rely on your comments to understand task state
3. **Be specific in comments** — Name files, functions, and decisions — not just "done" or "in progress"
4. **One task at a time** — Finish or block a task before picking up another
5. **Check before creating** — Run `pm task list --json` to avoid creating duplicate tasks
6. **Use subtasks for large work** — Break tasks with `--parent` rather than cramming everything into one task
