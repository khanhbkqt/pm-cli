---
description: Create execution plans for a phase
---

# Plan Phase Workflow

Break a phase into executable plans with wave-based ordering using `pm`.

## When to Use

After a milestone and phases exist, and you're ready to decompose a specific phase into concrete plans. The phase should be in `not_started` or `planning` status.

## Prerequisites

- Active milestone exists (`pm milestone list --status active`)
- Target phase exists (`pm phase list`)

---

## Step 1: Find the Target Phase

List phases for the active milestone:

```bash
pm phase list --json
```

Identify the phase you want to plan. Note its **DB integer ID** (not the phase number).

> **Important:** `pm phase show` takes the DB integer ID, not the phase number. Use `pm phase list --json` to find the correct ID.

---

## Step 2: Move Phase to Planning Status

```bash
pm phase update <phase-id> --status planning
```

This signals that planning is underway. The phase must be in `not_started` status for this transition.

---

## Step 3: Create Plans

Create each plan with a name, phase reference, plan number, and optional wave:

```bash
pm plan create "Core implementation" --phase <phase-id> --number 1 --wave 1
```

```bash
pm plan create "Integration tests" --phase <phase-id> --number 2 --wave 2
```

**Plan options:**
- `--phase <id>` (required) — DB integer ID of the parent phase
- `--number <n>` (required) — ordering number within the phase
- `--wave <n>` — execution wave (wave 1 runs first, then wave 2, etc.)
- `--content <text>` — plan description or details

**Wave assignment guidelines:**
- **Wave 1:** Foundation tasks with no dependencies on other plans
- **Wave 2:** Tasks that depend on Wave 1 outputs
- **Wave 3+:** Tasks that depend on Wave 2+ outputs
- Plans in the same wave can run in parallel

---

## Step 4: Verify Plans

List all plans for the phase:

```bash
pm plan list --phase <phase-id> --json
```

Check that plan numbers and wave assignments are correct.

---

## Cascading Behavior

- Phase must be in `not_started` or `planning` to add plans
- Plans are created with `pending` status by default

## Success Criteria

- [ ] Phase status is `planning`
- [ ] All plans created with correct numbers and waves
- [ ] `pm plan list --phase <id>` shows expected plans

## Next Steps

→ [Execute Phase](pm-execute-phase.md) — start executing the plans
