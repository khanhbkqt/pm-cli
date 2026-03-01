---
description: Quickly capture a todo item for later
---

# Add Todo Workflow

Capture a task for later without interrupting your current work.

## When to Use

When you notice something that needs doing but don't want to context-switch right now.

---

## Step 1: Add the Todo

```bash
pm task add "<description>" --priority low
```

**With more detail:**

```bash
pm task add "<description>" --priority low --description "<additional context>"
```

**Examples:**

```bash
pm task add "Update README with new CLI commands" --priority low
pm task add "Refactor error handling in phase module" --priority medium --description "Current error messages are too vague for debugging"
```

---

## Priority Levels

- `low` — do it eventually
- `medium` — do it soon
- `high` — do it next
- `urgent` — do it now

---

## Success Criteria

- [ ] Task created and visible in `pm task list`

## Next Steps

→ [Check Todos](pm-check-todos.md) — review and prioritize pending tasks
