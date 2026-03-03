---
description: Create and activate a new milestone with phases
---

# New Milestone Workflow

Create a new milestone, set its goal, activate it, and add initial phases.

## When to Use

When starting a new body of work — a feature set, version release, or major initiative.

## Prerequisites

- Project initialized (`pm init` has been run)
- Requirements clarified (SPEC.md exists or equivalent)

---

## Step 1: Clarify Requirements

Before creating a milestone, define what you're building:

→ **Run the [Brainstorm](pm-brainstorm.md) workflow** if requirements are unclear.

*Do not proceed until SPEC.md has Status: FINALIZED.*

---

## Step 2: Create the Milestone

```bash
pm milestone create <slug> "<name>" --goal "<goal description from SPEC>" --agent <name>
```

This does **two things**:
1. **Database** — stores brief metadata (id, name, goal, status)
2. **Filesystem** — auto-generates `.pm/milestones/<slug>/MILESTONE.md` from `.pm/templates/milestone.md`

**Example:**
```bash
pm milestone create v2.0-auth "Authentication System" --goal "Add user authentication per Spec" --agent <name>
```

---

## Step 3: Activate the Milestone

```bash
pm milestone update <slug> --status active --agent <name>
```

**Cascading:** Activating a milestone deactivates any currently-active milestone (single-active rule).

---

## Step 4: Add Phases

**Read `.pm/SPEC.md` and `.pm/IDEATION.md`** (brainstorm outputs) to derive the phase breakdown. Do NOT invent arbitrary phase names — phases must map directly to the SPEC's feature areas, deliverables, or logical implementation stages.

Break the milestone into 3-5 phases:

```bash
pm phase add "Database Schema" --number 1 --description "Create auth tables and models" --agent <name>
pm phase add "API Endpoints" --number 2 --description "Login, register, token refresh" --agent <name>
pm phase add "Integration Tests" --number 3 --description "End-to-end auth flow tests" --agent <name>
```

Each `pm phase add` does **two things**:
1. **Database** — stores brief metadata (number, name, description, status)
2. **Filesystem** — auto-generates `.pm/milestones/<slug>/<N>/PHASE.md` from `.pm/templates/phase-summary.md`

**Phase rules:**
- 3-5 phases per milestone
- Each phase has a clear deliverable derived from SPEC
- Dependencies flow forward (Phase 2 depends on Phase 1)
- All phases start as `not_started`

---

## Step 5: Enrich Documents from Brainstorming

**CRITICAL**: The auto-generated files contain placeholder tokens. You MUST now populate them with real content derived from `.pm/SPEC.md` and `.pm/IDEATION.md`.

### 5a: Enrich `MILESTONE.md`

Open `.pm/milestones/<slug>/MILESTONE.md` and populate **every section** with content from the brainstorming output:

| Section | Source | What to Write |
|---------|--------|---------------|
| **Vision** | SPEC.md goal/scope | One paragraph synthesizing the milestone's purpose and impact |
| **Must-Haves** | SPEC.md core features | Concrete, testable deliverables (not placeholders) |
| **Nice-to-Haves** | SPEC.md optional/deferred items | Features that could be cut without blocking the milestone |
| **Phases table** | Step 4 output | Actual phase names, numbers, and objectives from the phases you just created |
| **Success Criteria** | SPEC.md acceptance criteria | Measurable outcomes that prove the milestone is complete |
| **Architecture Decisions** | IDEATION.md / SPEC.md tech decisions | Key technical choices made during brainstorming with rationale |
| **Risks** | SPEC.md constraints, IDEATION.md concerns | Real risks identified during brainstorming with mitigation strategies |

### 5b: Enrich Each `PHASE.md`

Open each `.pm/milestones/<slug>/<N>/PHASE.md` and populate:

| Section | What to Write |
|---------|---------------|
| **Status** | Change from `Complete` → `Not Started` |
| **Objective** | Specific description of what this phase delivers, derived from the SPEC |
| **Deliverables** | Concrete deliverables that map to milestone must-haves |

**Quality check** — after enrichment, the documents should:
- ✅ Contain zero placeholder tokens (`{...}`)
- ✅ Every section reflects real decisions from brainstorming
- ✅ A new team member could read them and understand the full scope

---

## Step 6: Verify and Commit

```bash
pm progress --agent <name>
```

Confirm the milestone is active and phases match your SPEC.

### Update Project Files

1. **`.pm/ROADMAP.md`** — add the new milestone and its phases
2. **`.pm/STATE.md`** — set current position to the new milestone

```bash
git add -A
git commit -m "docs: create milestone <slug> with {N} phases"
```

---

## Git Rules

| When | Command |
|------|---------|
| After milestone + phases created | `git add -A && git commit -m "docs: create milestone <slug> with {N} phases"` |

## Related Workflows

| Workflow | Relationship |
|----------|-------------|
| Discuss Phase | Clarify phase scope before planning |
| Plan Phase | Create executable plans for Phase 1 |
| Progress | Check milestone progress |

## Offer Next Steps

Present the new milestone structure and suggest the first action:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM CLI ► MILESTONE CREATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Milestone: {slug}
Phases created: {N}

Documents enriched from brainstorming ✓

───────────────────────────────────────────────────────

▶ NEXT

/pm-discuss-phase — Clarify Phase 1 scope before planning (optional)
/pm-plan-phase    — Create executable plans for Phase 1
───────────────────────────────────────────────────────
```
