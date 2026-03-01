---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Plan CLI Commands & Formatters

## Objective
Create `pm plan create/list/show/update` commands and plan output formatters. This delivers the full plan management CLI, following the exact patterns established in `milestone.ts` and `phase.ts`.

## Context
- .gsd/SPEC.md
- .gsd/phases/4/RESEARCH.md
- src/cli/commands/phase.ts (pattern to follow)
- src/cli/commands/milestone.ts (pattern to follow — `show` nests child entities)
- src/core/plan.ts (createPlan, listPlans, getPlanById, updatePlan)
- src/core/workflow.ts (transitionPlan)
- src/output/formatter.ts (formatPhase, formatPhaseList as patterns)
- src/db/types.ts (Plan interface)
- src/index.ts (command registration)

## Tasks

<task type="auto">
  <name>Add plan formatters to formatter.ts</name>
  <files>src/output/formatter.ts</files>
  <action>
    Add `Plan` to the import from `../db/types.js`.

    Add two functions following `formatPhase`/`formatPhaseList` pattern:

    `formatPlan(plan: Plan, json: boolean): string`
    - JSON mode: `JSON.stringify(plan, null, 2)`
    - Text mode: key-value display with ID, Number, Name, Phase, Wave, Status, Content (if present), Created, Completed (if present)

    `formatPlanList(plans: Plan[], json: boolean): string`
    - JSON mode: `JSON.stringify(plans, null, 2)`
    - Empty: `'No plans found.'`
    - Table: columns `#`, `Name`, `Wave`, `Status`, `Created` using `formatTable`
    - Use `p.number` for `#` column (not `p.id`), date portion only for Created

    Export both functions.
  </action>
  <verify>npx tsx -e "import { formatPlan, formatPlanList } from './src/output/formatter.js'; console.log('OK')"</verify>
  <done>formatPlan and formatPlanList compile and are exported</done>
</task>

<task type="auto">
  <name>Create plan CLI commands and register</name>
  <files>src/cli/commands/plan.ts, src/index.ts</files>
  <action>
    Create `src/cli/commands/plan.ts` with `registerPlanCommands(program: Command)`.

    Follow `phase.ts` structure exactly. Commands:

    **`pm plan create <name>`**:
    - Options: `--phase <id>` (required — phase DB id), `--number <n>` (required), `--wave <n>` (default 1), `--content <text>`
    - Action: `getProjectDb()`, `resolveIdentity()`, `createPlan()`, output `✓ Plan #N created in phase #X` or JSON
    - Error handling: try/catch + `process.exit(1)`

    **`pm plan list`**:
    - Options: `--phase <id>` (required), `--status <status>`, `--wave <n>`
    - Action: `listPlans()`, output via `formatPlanList()`
    - No identity enforcement (read-only)

    **`pm plan show <id>`**:
    - Action: `getPlanById()`, output via `formatPlan()`
    - If not found: `Error: Plan #X not found.` + exit(1)
    - No identity enforcement (read-only)

    **`pm plan update <id>`**:
    - Options: `--name <name>`, `--status <status>`, `--content <text>`, `--wave <n>`, `--force`
    - **Key**: If `--status` is provided, route through `transitionPlan()` (from workflow.ts) instead of raw `updatePlan()`. Apply other field updates via `updatePlan()` separately.
    - If `--force`, pass `{ force: true }` to `transitionPlan()`
    - Non-status fields use `updatePlan()` directly
    - Identity enforcement via `resolveIdentity()`

    In `src/index.ts`:
    - Import `registerPlanCommands` from `./cli/commands/plan.js`
    - Call `registerPlanCommands(program)` after `registerPhaseCommands(program)`
  </action>
  <verify>npx tsx src/index.ts plan --help</verify>
  <done>`pm plan create/list/show/update` all appear in help output</done>
</task>

<task type="auto">
  <name>Enhance phase show to display associated plans</name>
  <files>src/cli/commands/phase.ts</files>
  <action>
    In `phase.ts`, modify the `show` command action:
    - Import `listPlans` from `../../core/plan.js`
    - Import `formatPlanList` from `../../output/formatter.js`
    - After displaying phase details, fetch `listPlans(db, parseInt(id, 10))`
    - If plans exist, print `\nPlans:` then `formatPlanList(plans, false)`
    - In JSON mode, add `plans` array to the output object (same pattern as milestone show adding phases)

    Avoid:
    - Don't change the existing phase detail format
    - Don't import formatter functions that are already imported
  </action>
  <verify>npx tsx -e "import { registerPhaseCommands } from './src/cli/commands/phase.js'; console.log('OK')"</verify>
  <done>Phase show command compiles and includes plan listing logic</done>
</task>

## Success Criteria
- [ ] `pm plan create`, `list`, `show`, `update` commands work end-to-end
- [ ] `pm plan update --status X` routes through workflow transitions
- [ ] `pm phase show` displays associated plans
- [ ] All formatters handle JSON and text modes
- [ ] `--force` flag bypasses transition validation on plan update
