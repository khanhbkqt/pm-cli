---
description: Review and prioritize pending tasks
---

# Check Todos Workflow

List pending tasks, prioritize them, and pick the next one to work on.

## When to Use

When you have free cycles and want to see what needs doing, or at the start of a session to pick up work.

---

## Step 1: List Pending Tasks

```bash
pm task list --status todo --json
```

---

## Step 2: Review and Prioritize

Sort tasks by priority:
1. `urgent` — handle immediately
2. `high` — handle next
3. `medium` — handle soon
4. `low` — handle eventually

Filter by priority if needed:

```bash
pm task list --status todo --priority high --json
```

---

## Step 3: Pick a Task

Choose the highest-priority task you can work on and follow the [Task Lifecycle](task-lifecycle.md) workflow to claim and complete it.

---

## Tips

- Check todos at the start of each session
- Don't let urgent/high tasks pile up — address them promptly
- Use `pm task list --json` for programmatic parsing

## Success Criteria

- [ ] All pending tasks reviewed
- [ ] Next task selected (or all tasks addressed)

## Next Steps

→ [Task Lifecycle](task-lifecycle.md) — claim and work on a task
