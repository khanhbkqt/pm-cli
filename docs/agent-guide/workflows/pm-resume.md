---
description: Restore context and resume from a previous session
---

# Resume Work Workflow

Pick up where a previous session left off by restoring saved context and finding the next plan to work on.

## When to Use

When starting a new session and previous work was paused with the Pause Work workflow (or you need to understand current project state).

## Prerequisites

- Project is initialized
- Previous session context was saved (optional but helpful)

---

## Step 1: Check Saved Context

```bash
pm context get session:last-phase
```

```bash
pm context get session:last-plan
```

```bash
pm context get session:notes
```

If no saved context exists, skip to Step 2.

---

## Step 2: Review Overall Progress

```bash
pm progress
```

Understand where the project stands — which phases are done, in progress, or pending.

---

## Step 3: Find Pending Work

List plans for the active phase:

```bash
pm plan list --phase <phase-id> --json
```

Look for:
1. Plans in `in_progress` status — resume these first
2. Plans in `pending` status — start the next one
3. Plans in `failed` status — consider retrying

---

## Step 4: Resume or Start Next Plan

**If resuming an in-progress plan:**
Review what was done previously (check session notes) and continue the work.

**If starting a new plan:**

```bash
pm plan update <plan-id> --status in_progress
```

Then follow the [Execute Phase](pm-execute-phase.md) workflow.

---

## Tips

- Always check `pm progress` first to orient yourself
- Read session notes carefully to avoid redoing work
- If context is missing, review git history for recent commits

## Success Criteria

- [ ] Current project state is understood
- [ ] Next task is identified
- [ ] Work is resumed (plan is `in_progress`)

## Next Steps

→ [Execute Phase](pm-execute-phase.md) — continue executing plans
→ [Check Progress](pm-progress.md) — if you need more context
