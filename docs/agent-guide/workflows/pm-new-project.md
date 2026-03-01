---
description: Initialize a new project with pm
---

# New Project Workflow

Bootstrap a new project from scratch — initialize the database, create a milestone, and set up initial phases.

## When to Use

When starting a brand new project that will be managed with `pm`. This is the first workflow to run.

## Prerequisites

- `pm` CLI is installed

---

## Step 1: Initialize the Project

```bash
pm init
```

This creates the local pm database and configuration. Run this once per project.

---

## Step 2: Create the First Milestone

```bash
pm milestone create <slug> "<name>" --goal "<goal description>"
```

**Example:**

```bash
pm milestone create v1.0-mvp "MVP Release" --goal "Deliver core features for initial launch"
```

---

## Step 3: Activate the Milestone

```bash
pm milestone update <slug> --status active
```

---

## Step 4: Add Initial Phases

```bash
pm phase add "Research & Design" --number 1 --description "Investigate requirements and design architecture"
pm phase add "Core Implementation" --number 2 --description "Build the main features"
pm phase add "Testing" --number 3 --description "Write and run tests"
pm phase add "Documentation" --number 4 --description "Write user and developer docs"
```

---

## Step 5: Verify Setup

```bash
pm milestone show <slug>
pm phase list
```

Confirm the milestone is active and all phases are listed.

---

## Success Criteria

- [ ] `pm init` completed successfully
- [ ] Milestone created and active
- [ ] Initial phases added
- [ ] `pm progress` shows the project structure

## Next Steps

→ [Plan Phase](pm-plan-phase.md) — create plans for the first phase
