---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: `pm progress` CLI + Formatter + API Route

## Objective

Add the `pm progress` command that displays active milestone progress (phases + plan completion) in both human and JSON format. Also add `GET /api/progress` API route for dashboard consumption.

## Context

- `.gsd/SPEC.md`
- `.gsd/ROADMAP.md` (Phase 5 must-have: `pm progress` hiển thị tiến độ milestone/phase)
- `.gsd/phases/5/RESEARCH.md`
- `src/core/milestone.ts` — `getActiveMilestone`, `getMilestoneById`, `listMilestones`
- `src/core/phase.ts` — `listPhases`
- `src/core/plan.ts` — `listPlans`
- `src/output/formatter.ts` — existing format patterns to follow
- `src/server/routes/status.ts` — API route pattern to follow
- `src/server/app.ts` — for mounting new router
- `src/index.ts` — for registering new CLI command

## Tasks

<task type="auto">
  <name>Create src/cli/commands/progress.ts</name>
  <files>src/cli/commands/progress.ts</files>
  <action>
    Create new file that exports `registerProgressCommand(program: Command): void`.

    Command signature:
    - `pm progress` — shows active milestone progress
    - `--milestone <id>` — show a specific milestone by slug/id instead
    - `--json` — output JSON

    Logic:
    1. `const db = getProjectDb()`
    2. Resolve milestone: if `--milestone` flag, call `getMilestoneById(db, id)`. Otherwise call `getActiveMilestone(db)`.
    3. If no milestone found: print "No active milestone. Create one with: pm milestone create" then exit 0.
    4. For each phase from `listPhases(db, milestone.id)`:
       - fetch `listPlans(db, phase.id)`
       - compute: plans_total, plans_done (status==='completed'), plans_failed (status==='failed')
    5. Compute summary: phases_total, phases_complete (status==='completed'), phases_pct
    6. Call `formatProgress({ milestone, phases: enrichedPhases, summary }, json)` from formatter
    7. `db.close()`

    Error handling: wrap in try/catch, print error message, exit 1.
    Do NOT require agent identity for read-only progress command (same as `pm status`).
  </action>
  <verify>npx tsx src/index.ts progress --help</verify>
  <done>Output shows `pm progress [options]` with `--milestone` and `--json` options listed</done>
</task>

<task type="auto">
  <name>Add formatProgress() to src/output/formatter.ts</name>
  <files>src/output/formatter.ts</files>
  <action>
    Append a new export function `formatProgress` at the end of the file.

    Input type (define inline, no new type file needed):
    ```ts
    interface PhaseProgress extends Phase {
      plans_total: number;
      plans_done: number;
      plans_failed: number;
    }
    interface ProgressData {
      milestone: Milestone;
      phases: PhaseProgress[];
      summary: { phases_total: number; phases_complete: number; phases_pct: number };
    }
    ```

    Status icons (human format):
    - completed → ✅
    - in_progress → ▶
    - planning → 🔵
    - skipped → ⏭
    - not_started → ⬜

    Human output format:
    ```
    Active Milestone: <name> — <goal>
    Status: <status>

    Phases:
      <icon>  <num>  <name padded to 30 chars>  (<done>/<total> plans)

    Progress: <complete>/<total> phases complete (<pct>%)
    ```
    Use `formatTable` for the phases rows for consistent column alignment.

    JSON output: `JSON.stringify({ milestone, phases, summary }, null, 2)`

    Import Milestone and Phase types from `../db/types.js` (already imported at top of file — check current imports first and only add what's missing).
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -20</verify>
  <done>No TypeScript errors for formatter.ts</done>
</task>

<task type="auto">
  <name>Register progress command in src/index.ts</name>
  <files>src/index.ts</files>
  <action>
    Add import line:
    ```ts
    import { registerProgressCommand } from './cli/commands/progress.js';
    ```
    Add registration call after `registerPlanCommands(program)`:
    ```ts
    registerProgressCommand(program);
    ```
  </action>
  <verify>npx tsx src/index.ts --help | grep progress</verify>
  <done>Output includes "progress" in the commands list</done>
</task>

<task type="auto">
  <name>Create src/server/routes/progress.ts and mount it in app.ts</name>
  <files>src/server/routes/progress.ts, src/server/app.ts</files>
  <action>
    Create `src/server/routes/progress.ts`:
    - Import Router from express, Database from better-sqlite3
    - Import getActiveMilestone, listPhases, listPlans
    - Export `createProgressRouter(db: Database.Database): Router`
    - GET `/` handler:
      1. Get active milestone via getActiveMilestone(db)
      2. If none: return 404 `{ error: 'No active milestone' }`
      3. Enrich phases with plan stats (same logic as CLI command)
      4. Return 200 `{ milestone, phases, summary }`

    In `src/server/app.ts`:
    - Import createProgressRouter
    - Mount: `app.use('/api/progress', createProgressRouter(db))`
    - Add BEFORE the fallback 404 route (check existing order in app.ts)

    Follow the exact same pattern as `src/server/routes/status.ts`.
  </action>
  <verify>npx tsc --noEmit 2>&1 | head -20</verify>
  <done>No TypeScript errors; app.ts compiles cleanly</done>
</task>

## Success Criteria

- [ ] `pm progress` shows active milestone with phase table (human format)
- [ ] `pm progress --json` outputs valid JSON with milestone, phases, summary keys
- [ ] `pm progress` with no active milestone prints friendly message, exits 0
- [ ] `GET /api/progress` returns 200 with milestone+phases+summary
- [ ] `GET /api/progress` with no active milestone returns 404
- [ ] `npx tsc --noEmit` passes with no errors
