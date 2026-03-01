---
description: Check milestone and phase progress
---

# Check Progress Workflow

View the current state of your milestone, including phase completion percentages and plan statuses.

## When to Use

At any point during project work when you need to understand overall progress, identify blockers, or decide what to work on next.

## Prerequisites

- At least one milestone exists

---

## Step 1: Check Overall Progress

```bash
pm progress
```

This shows the active milestone's progress breakdown by phase.

For a specific milestone:

```bash
pm progress --milestone <milestone-id>
```

**JSON output for programmatic use:**

```bash
pm progress --milestone <milestone-id> --json
```

---

## Step 2: Review Phase Details

List all phases to see their statuses:

```bash
pm phase list --json
```

For details on a specific phase (using DB integer ID):

```bash
pm phase show <phase-id>
```

> **Note:** `pm phase show` takes the DB integer ID, not the phase number. Use `pm phase list --json` to find the correct ID.

---

## Step 3: Drill Into Plans

List plans for a specific phase:

```bash
pm plan list --phase <phase-id> --json
```

Filter by status to find incomplete work:

```bash
pm plan list --phase <phase-id> --status pending
```

Filter by wave:

```bash
pm plan list --phase <phase-id> --wave 1
```

---

## Step 4: Review Milestone Details

For full milestone information:

```bash
pm milestone show <milestone-id> --json
```

This shows the milestone goal, status, and associated phases.

---

## Success Criteria

- [ ] Current progress is understood
- [ ] Next action is clear (which plan/phase to work on)

## Next Steps

→ [Execute Phase](pm-execute-phase.md) — continue working on incomplete plans
→ [Audit Milestone](pm-audit-milestone.md) — if all phases look done
