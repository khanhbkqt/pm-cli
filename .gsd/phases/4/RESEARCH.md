---
phase: 4
level: 2
researched_at: 2026-03-01
---

# Phase 4 Research — Plan & Execution CLI

## Questions Investigated

1. What CLI commands are needed for plan management?
2. How should `--status` updates be routed through `workflow.ts`?
3. What output formatting is needed for plans?
4. How should plans reference their parent phase (UX)?
5. What testing approach should be used?
6. Are there any gaps in existing core functions?

## Findings

### Q1: Plan CLI Commands

Following the existing pattern from `milestone.ts` and `phase.ts`, the plan CLI needs:

```
pm plan create <name>         -- Create a plan within a phase
  --phase <id>                -- Phase ID (required, or use --number + active milestone)
  --number <n>                -- Plan number within phase
  --wave <n>                  -- Wave number (default: 1)
  --content <text>            -- Plan content/description

pm plan list                  -- List plans for a phase
  --phase <id>                -- Phase ID (required or inferred)
  --status <status>           -- Filter: pending, in_progress, completed, failed
  --wave <n>                  -- Filter by wave number

pm plan show <id>             -- Show plan details

pm plan update <id>           -- Update plan fields
  --name <name>               -- New name
  --status <status>           -- New status (routed through workflow)
  --content <text>            -- New content
  --wave <n>                  -- New wave number
  --force                     -- Bypass transition validation
```

### Q2: Workflow Integration for `--status` Updates

**Current state (gap):** `pm milestone update --status` and `pm phase update --status` in `src/cli/commands/{milestone,phase}.ts` call raw CRUD functions (`updateMilestone`, `updatePhase`) directly — bypassing `workflow.ts` transition validation and cascading.

**Fix needed in Phase 4:**
- `pm milestone update --status X` → call `transitionMilestone()` instead of `updateMilestone()`
- `pm phase update --status X` → call `transitionPhase()` instead of `updatePhase()`
- `pm plan update --status X` → call `transitionPlan()` instead of `updatePlan()`
- Non-status fields (name, goal, description, content) still use direct CRUD

**Implementation pattern:**
```typescript
// In update action handler:
if (opts.status) {
    // Route through workflow for status changes
    transitionX(db, id, opts.status, { force: opts.force });
    // Still apply other field updates via CRUD
    const otherUpdates = { name: opts.name, ... };
    if (Object.values(otherUpdates).some(v => v !== undefined)) {
        updateX(db, id, otherUpdates);
    }
} else {
    updateX(db, id, opts);
}
```

**`--force` flag:** Add to all three update commands to bypass workflow validation when needed.

### Q3: Plan Formatters

Add to `src/output/formatter.ts` (following existing patterns):

**`formatPlan(plan, json)`** — Single plan detail view:
```
ID:      #1
Number:  1
Name:    Schema migration
Phase:   3
Wave:    1
Status:  pending
Content: Create migration scripts...
Created: 2026-03-01
```

**`formatPlanList(plans, json)`** — Table view:
```
 #  │ Name              │ Wave │ Status     │ Created
────┼───────────────────┼──────┼────────────┼──────────
 1  │ Schema migration  │ 1    │ pending    │ 2026-03-01
 2  │ Seed data         │ 1    │ in_progress│ 2026-03-01
```

Import `Plan` type into formatter.ts.

### Q4: Phase Resolution UX

Plans belong to phases. For user convenience:
- `--phase <id>` flag uses the phase's DB `id` (auto-increment integer)
- Phase show command should display associated plans (add to `phase show`)

### Q5: Testing Approach

**Unit tests:** Core `plan.ts` functions already have tests in `tests/plan.test.ts` (Phase 1).

**CLI integration tests:** Create `tests/plan-cli.test.ts` following `milestone-cli.test.ts` pattern:
- `execSync` with `npx tsx src/index.ts`
- `run()` and `runExpectFail()` helpers
- `beforeEach`: init project + register agent + create milestone + activate + add phase
- Test cases: create, list, show, update, status transitions, --force flag, --json output

**Workflow integration tests:** Update existing tests or create new ones to verify that `--status` changes on milestone/phase/plan CLI properly route through workflow transitions.

### Q6: Core Function Gaps

**No gaps found.** All needed functions exist:
- `src/core/plan.ts`: `createPlan`, `listPlans`, `getPlanById`, `updatePlan`
- `src/core/workflow.ts`: `transitionMilestone`, `transitionPhase`, `transitionPlan`

The `phase show` command currently doesn't display plans — this should be enhanced to show associated plans (similar to how `milestone show` displays phases).

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Plan CLI structure | `pm plan create/list/show/update` | Matches milestone/phase pattern exactly |
| Status routing | Workflow for `--status`, CRUD for other fields | Enforces transition rules without breaking non-status updates |
| Retrofit existing CLIs | Wire milestone/phase `--status` through workflow too | Consistent behavior, uses Phase 3 work |
| `--force` flag | Add to all update commands | Escape hatch per Phase 3 research |
| Phase reference | `--phase <id>` (DB integer) | Simple, unambiguous |
| Phase show enhancement | Add plans display to `pm phase show` | Natural hierarchy visibility |

## Patterns to Follow

- Commander.js `registerXCommands(program)` pattern
- `getProjectDb()` + `resolveIdentity()` for DB/identity
- JSON output via `program.opts().json`
- Try/catch with `process.exit(1)` error handling
- `db.close()` before exit
- Formatter pattern: single detail view + table list view

## Anti-Patterns to Avoid

- Don't create separate formatter files — add to existing `formatter.ts`
- Don't bypass workflow module for status changes
- Don't skip identity enforcement on mutating commands
- Don't add `--force` to create commands (only to update/status)

## Dependencies Identified

No new dependencies. All libraries already in use:
- `commander` — CLI framework
- `better-sqlite3` — DB access  
- `vitest` — test framework

## Risks

- **Retrofitting milestone/phase CLIs**: Low risk — small change (swap function call), backward compatible
- **Phase ID UX**: Users must know phase DB ID — mitigated by `pm phase list` showing IDs
- **Test timeout**: CLI tests with multiple `execSync` calls can be slow — use `{ timeout: 15000 }` where needed

## Ready for Planning

- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
