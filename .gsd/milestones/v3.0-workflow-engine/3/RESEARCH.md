---
phase: 3
level: 3
researched_at: 2026-03-01
---

# Phase 3 Research — Workflow State Machine

## Questions Investigated

1. What status transitions exist for each entity (milestone, phase, plan)?
2. What cascading behaviors should occur on state changes?
3. How does the workflow module interact with existing CRUD?
4. How should `workflow_state` table be used for session persistence?
5. What does GSD's own state machine workflow look like?
6. What CLI changes are needed?

## Findings

### Q1: Status Transition Maps (from DB Schema + GSD Workflows)

**Milestone** (`planned → active → completed → archived`):

| From | Valid Next States |
|------|-------------------|
| `planned` | `active` |
| `active` | `completed`, `archived` |
| `completed` | `archived` |
| `archived` | *(terminal)* |

Constraint: Only one milestone can be `active` at a time (GSD single-focus).

**Phase** (`not_started → planning → in_progress → completed | skipped`):

| From | Valid Next States |
|------|-------------------|
| `not_started` | `planning`, `in_progress`, `skipped` |
| `planning` | `in_progress`, `skipped` |
| `in_progress` | `completed`, `skipped` |
| `completed` | *(terminal)* |
| `skipped` | `not_started` (un-skip) |

GSD workflow mapping: PLAN.md created = `planning`, execution started = `in_progress`, SUMMARY.md exists = `completed`.

**Plan** (`pending → in_progress → completed | failed`):

| From | Valid Next States |
|------|-------------------|
| `pending` | `in_progress` |
| `in_progress` | `completed`, `failed` |
| `completed` | *(terminal)* |
| `failed` | `pending` (retry) |

### Q2: Cascading Behaviors (from GSD `/execute` and `/complete-milestone`)

1. **Plan → Phase auto-start**: When first plan moves to `in_progress`, auto-transition phase `not_started → in_progress`
2. **Plan → Phase auto-complete**: When ALL plans in phase are `completed`, auto-transition phase to `completed`
3. **Milestone activation**: Setting milestone to `active` should deactivate any currently active milestone (set to `planned`)
4. **Milestone completion guard**: `/complete-milestone` checks ALL phases are `completed`/`skipped` — enforce in state machine
5. **No auto-complete milestone**: Too significant — always explicit per GSD philosophy

### Q3: Architecture — Workflow as Wrapper Layer

Current architecture (Phases 1-2):
```
CLI Commands → src/core/{milestone,phase,plan}.ts → SQLite
```

New architecture (Phase 3):
```
CLI Commands → src/core/workflow.ts → src/core/{milestone,phase,plan}.ts → SQLite
```

- Existing `update*` functions stay as-is (dumb CRUD pass-through)
- New `workflow.ts` adds `transition*` functions: validate → cascade → delegate to CRUD
- CLI `--status` changes route through workflow module
- Non-status updates (name, description, content) still use direct CRUD

### Q4: Workflow State (Session Persistence)

The `workflow_state` table (key-value store, already in schema, unused) tracks:
- `current_milestone` — active milestone ID
- `current_phase` — current phase number
- `session_context` — JSON blob for resumable sessions

Needed functions:
- `getWorkflowState(db, key)` → string | undefined
- `setWorkflowState(db, key, value, updated_by)` → WorkflowState

### Q5: GSD Workflow State Machine (from 7 workflow files)

GSD's core protocol: **SPEC → PLAN → EXECUTE → VERIFY → COMMIT**

Lifecycle mapping to `pm-cli` status values:

| GSD Step | Milestone Status | Phase Status | Plan Status |
|----------|-----------------|-------------|-------------|
| /new-milestone | `planned` | — | — |
| Activate | `active` | — | — |
| /plan N | — | `planning` | `pending` |
| /execute N | — | `in_progress` | `in_progress` → `completed` |
| /verify N | — | `completed` (pass) | — |
| /complete-milestone | `completed` | all `completed` | all `completed` |
| Archive | `archived` | — | — |

Key GSD patterns that inform implementation:
- Wave-based execution: plans grouped by dependency wave, wave N+1 waits for N
- Gap closure: failed verification → new plans with `gap_closure: true` → re-execute
- File-based completion tracking: PLAN.md (created) → SUMMARY.md (done)
- Single active milestone: GSD always works on one milestone at a time

### Q6: CLI Integration

**No new CLI commands.** Modify existing `pm milestone update --status` and `pm phase update --status` to route through workflow module.

Error messages for invalid transitions:
```
Error: Cannot transition milestone from 'planned' to 'completed'.
Valid transitions from 'planned': active
```

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Workflow as wrapper | `workflow.ts` wraps existing CRUD | Keeps CRUD simple, logic in one place |
| Transition validation | Explicit map, reject invalid | Clear errors, prevents invalid states |
| Plan→Phase cascade | Auto-start + auto-complete | Reduces manual overhead, matches GSD /execute |
| Milestone activation | Deactivate current active | GSD single-focus methodology |
| Milestone completion | Guard (all phases done), no auto | Too significant for auto-transition |
| Phase sequencing | Advisory warning, not enforced | Per design philosophy — tool ≠ process |
| Session persistence | workflow_state key-value table | Already in schema, simple + extensible |
| CLI surface | Modify existing, no new commands | Transparent upgrade |

## Patterns to Follow

- Wrap CRUD, don't duplicate SQL
- Throw descriptive errors with valid alternatives
- TypeScript union types for transition maps (type-safe)
- Follow existing vitest patterns (temp DB, beforeEach/afterEach)
- `--force` flag to bypass transition validation when needed

## Anti-Patterns to Avoid

- Don't move SQL into workflow module — delegate to core CRUD
- Don't auto-complete milestones
- Don't enforce strict phase ordering (warn only)
- Don't modify existing `update*` function signatures

## Dependencies Identified

No new dependencies.

## Risks

- **Cascading complexity**: Mitigated by SQLite single-writer + sync ops
- **Breaking existing tests**: Mitigated by not changing CRUD signatures
- **Over-engineering**: Mitigated by flat transition map, 1 module

## Ready for Planning

- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
- [x] GSD workflow patterns analyzed
