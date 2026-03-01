---
description: Create and activate a new milestone
---

# New Milestone Workflow

Create a new milestone, set its goal, activate it, and add initial phases.

## When to Use

When starting a new body of work — a feature set, a version release, or a major initiative. Each milestone is a container for phases and plans.

## Prerequisites

- Project initialized (`pm init` has been run)

---

## Step 1: Create the Milestone

```bash
pm milestone create <slug> "<name>" --goal "<goal description>"
```

**Example:**

```bash
pm milestone create v2.0-auth "Authentication System" --goal "Add user authentication with JWT tokens and role-based access control"
```

**JSON output:**

```bash
pm milestone create v2.0-auth "Authentication System" --goal "Add auth" --json
```

The `<slug>` is a unique identifier (e.g., `v2.0-auth`) and `<name>` is the display name.

---

## Step 2: Activate the Milestone

```bash
pm milestone update <slug> --status active
```

**Cascading behavior:** Activating a milestone automatically deactivates any currently-active milestone. Only one milestone can be active at a time (single-active rule).

---

## Step 3: Add Phases

Add phases to structure the work:

```bash
pm phase add "Database Schema" --number 1 --description "Create auth tables and models"
```

```bash
pm phase add "API Endpoints" --number 2 --description "Build login, register, and token refresh endpoints"
```

```bash
pm phase add "Integration Tests" --number 3 --description "End-to-end auth flow tests"
```

Phase options:
- `--number <n>` (required) — ordering number
- `--milestone <slug>` — defaults to the active milestone
- `--description <text>` — phase description

All phases start in `not_started` status.

---

## Step 4: Verify Setup

```bash
pm milestone show <slug> --json
```

```bash
pm phase list --json
```

Confirm the milestone is active and all phases are listed.

---

## Milestone Status Transitions

```
planned → active → completed → archived
```

## Cascading Behavior

- Activating a milestone deactivates any currently-active milestone (single-active rule)
- New phases default to `not_started` status

## Success Criteria

- [ ] Milestone created and active
- [ ] All initial phases added
- [ ] `pm milestone show` displays correct goal and phases

## Next Steps

→ [Plan Phase](pm-plan-phase.md) — create plans for the first phase
