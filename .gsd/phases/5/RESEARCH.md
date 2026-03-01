---
phase: 5
level: 2
researched_at: 2026-03-01
---

# Phase 5 Research — Progress & Dashboard

## Questions Investigated

1. What data is needed for `pm progress` output?
2. What existing CRUD functions can serve progress queries?
3. What is the required human-readable vs `--json` format?
4. Does `progress` need a new core module or can it compose existing CRUD?
5. What is the dashboard scope — new features or already complete?
6. How do tests follow existing patterns?

## Findings

### Q1: Data for `pm progress`

From ROADMAP must-haves: `pm progress` should display **milestone/phase progress**.

Required data model:
- Active milestone (name, status, goal)
- All phases for that milestone (number, name, status)
- For each phase: plan count, completed count, failed count
- Summary: phase completion ratio

### Q2: Available CRUD Functions

| Function | File | Use |
|----------|------|-----|
| `getActiveMilestone(db)` | `src/core/milestone.ts` | Fetch current active milestone |
| `listPhases(db, milestoneId)` | `src/core/phase.ts` | All phases for milestone |
| `listPlans(db, phaseId)` | `src/core/plan.ts` | Plans per phase for stats |
| `listMilestones(db)` | `src/core/milestone.ts` | All milestones (for `--all` flag) |

**Decision**: No new core module needed. `pm progress` composes existing CRUD functions inline in the CLI command.

### Q3: Output Format Design

**Human-readable (`pm progress`):**
```
Active Milestone: v3.0-workflow-engine — Workflow Engine
Status: active

Phases:
  ✅  1  DB Schema & Models         (2/2 plans)
  🔵  2  Milestone & Phase CLI      (planned)
  ✅  3  Workflow State Machine     (2/2 plans)
  ✅  4  Plan & Execution CLI       (3/3 plans)
  ▶   5  Progress & Dashboard      (in_progress)
  ⬜  6  Tests & Documentation      (not started)
  ⬜  7  Agent Workflow Templates   (not started)
  ⬜  8  Install System             (not started)

Progress: 3/8 phases complete
```

**JSON (`pm progress --json`):**
```json
{
  "milestone": { "id": "v3.0-...", "name": "...", "status": "active" },
  "phases": [
    { "number": 1, "name": "...", "status": "completed", "plans_total": 2, "plans_done": 2 }
  ],
  "summary": { "phases_total": 8, "phases_complete": 3, "phases_pct": 37 }
}
```

**Scope clarification**: `pm progress` focuses on **active milestone** by default. `--milestone <id>` flag added to show any milestone's progress.

### Q4: Core Module Decision

**No new `src/core/progress.ts` needed.** The data composition is display logic, done in the CLI command itself. Formatter gets a `formatProgress()` function in `src/output/formatter.ts`.

### Q5: Dashboard Scope

`pm dashboard` already exists — launches the Express + React web UI. Phase 5 "Dashboard" refers to enriching the web dashboard with **milestone/phase progress data**, exposed via a new API route `GET /api/progress`.

Scope:
- New `GET /api/progress` route in `src/server/routes/`
- `pm dashboard` command unchanged (already works)

### Q6: Test Patterns

All existing test patterns use:
```ts
import { execSync } from 'child_process';
const CLI = path.resolve('src/index.ts');
function run(args: string, cwd: string): string {
    return execSync(`npx tsx ${CLI} ${args}`, { cwd, encoding: 'utf-8', ... }).trim();
}
```

New test file: `tests/progress-cli.test.ts` following the exact same pattern.
API route tested by extending `tests/api.test.ts` with the `/api/progress` endpoint.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Core module | No new module | Compose existing CRUD in CLI command |
| Default scope | Active milestone | Most useful default; `--milestone` flag for others |
| Dashboard extension | New API route `/api/progress` | Keeps existing `pm dashboard` command intact |
| JSON format | Structured with milestone + phases + summary | Machine-parseable for agents |

## Patterns to Follow

- `src/cli/commands/milestone.ts` — Command registration pattern
- `src/output/formatter.ts` — `formatMilestone`, `formatPhaseList` patterns for table/detail view
- `tests/plan-cli.test.ts` — Test setup with milestones, phases, plans
- `src/server/routes/status.ts` — Express route pattern for API

## Anti-Patterns to Avoid

- **New core/progress.ts**: Unnecessary abstraction — progress is a read/display concern
- **Auto-refreshing progress**: Keep it stateless and synchronous; no polling
- **Modifying existing milestone/phase CRUD**: Only read, don't add side effects

## Dependencies Identified

| Package | Version | Purpose |
|---------|---------|---------|
| (none new) | — | All needed packages already installed |

## Risks

- **Phase 2 status "Planned" not "completed"**: Progress will correctly show it with plan count 0
- **Empty milestone**: `getActiveMilestone` returns `undefined` — need graceful message

## Ready for Planning

- [x] Questions answered
- [x] Approach selected (compose existing CRUD)
- [x] Dependencies identified (none new)
- [x] Output format designed
- [x] Test strategy clear
