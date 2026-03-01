---
description: Save session state before stopping work
---

# Pause Work Workflow

Capture your current position and context so you (or another agent) can resume later without losing progress.

## When to Use

When ending a work session — switching tasks, running out of context, or stopping for the day. This ensures nothing is lost between sessions.

## Prerequisites

- Work is in progress on some phase/plan

---

## Step 1: Check Current State

```bash
pm progress
```

Note which phase and plan you were working on.

---

## Step 2: Save Session Context

Record your current position:

```bash
pm context set session:last-phase <phase-id>
```

```bash
pm context set session:last-plan <plan-id>
```

```bash
pm context set session:notes "<summary of where you left off and what to do next>"
```

**Example:**

```bash
pm context set session:last-phase 12
pm context set session:last-plan 34
pm context set session:notes "Finished implementing API routes in plan 2. Next: write integration tests in plan 3."
```

---

## Step 3: Clean Up In-Progress Plans

If you have plans in `in_progress` status that won't be resumed soon, consider leaving them as-is with a note, or resetting to `pending`:

- **Resuming soon** — Leave as `in_progress`
- **Not resuming soon** — Reset to `pending` so another agent can pick it up

```bash
pm plan update <plan-id> --status pending
```

---

## Tips

- Be specific in session notes — include file names, function names, and next actions
- Don't leave plans as `in_progress` indefinitely without context
- Save context before your context window fills up

## Success Criteria

- [ ] Current phase/plan IDs saved via `pm context set`
- [ ] Session notes capture what was done and what's next
- [ ] No orphaned `in_progress` plans without context

## Next Steps

→ [Resume Work](pm-resume.md) — pick up where you left off
