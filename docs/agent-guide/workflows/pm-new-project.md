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

## Step 2: Brainstorm & Clarify Requirements

Before creating milestones or phases, you must define what you are building.

→ **Run the [Brainstorm Phase](pm-brainstorm.md)** workflow to clarify requirements, map user flows, and draft your initial `SPEC.md`.

*Do not proceed to the next step until your `SPEC.md` has `Status: FINALIZED`.*

---

## Step 3: Create the First Milestone

Based on the finalized `SPEC.md`, create a milestone that represents the first major deliverable.

```bash
pm milestone create <slug> "<name>" --goal "<goal description from SPEC>"
```

**Example:**
```bash
pm milestone create v1.0-mvp "MVP Release" --goal "Deliver core features defined in the Spec"
```

Activate the milestone:
```bash
pm milestone update <slug> --status active
```

---

## Step 4: Add Initial Phases

Break down the milestone into high-level phases based on the Core Features defined in your `SPEC.md`.

```bash
pm phase add "Foundation & Setup" --number 1 --description "Project setup and database schema"
pm phase add "Core Feature A" --number 2 --description "Implement Feature A"
pm phase add "Core Feature B" --number 3 --description "Implement Feature B"
```

---

## Step 5: Verify Setup

```bash
pm milestone show <slug>
pm phase list
```

Confirm the milestone is active and phases match your Spec.

---

## Success Criteria

- [ ] `pm init` completed successfully
- [ ] Brainstorming completed and `SPEC.md` is `FINALIZED`
- [ ] Milestone created and active
- [ ] Initial phases added based on the Spec
- [ ] `pm progress` shows the project structure

## Next Steps

→ [Plan Phase](pm-plan-phase.md) — create executable plans for your first phase
