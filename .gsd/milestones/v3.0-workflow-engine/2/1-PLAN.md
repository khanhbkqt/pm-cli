---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Milestone & Phase Output Formatters + CLI Commands

## Objective
Wire the existing core milestone and phase CRUD functions to CLI commands via Commander.js, and add output formatters for human-readable and JSON display. This delivers the `pm milestone create|list|show|update` and `pm phase add|list|show|update` CLI surface.

## Context
- .gsd/SPEC.md
- .gsd/phases/2/RESEARCH.md
- src/core/milestone.ts — createMilestone, listMilestones, getMilestoneById, updateMilestone, getActiveMilestone
- src/core/phase.ts — addPhase, listPhases, getPhaseById, updatePhase, getPhaseByNumber
- src/output/formatter.ts — formatTable helper, existing entity formatters
- src/cli/commands/task.ts — reference pattern
- src/index.ts — command registration

## Tasks

<task type="auto">
  <name>Add milestone and phase formatters to formatter.ts</name>
  <files>src/output/formatter.ts</files>
  <action>
    Add 4 new formatter functions following the existing pattern:

    1. `formatMilestone(milestone: Milestone, json: boolean): string`
       - JSON mode: `JSON.stringify(milestone, null, 2)`
       - Human mode: Multi-line display showing ID, Name, Goal, Status, Creator, Created, Completed
    
    2. `formatMilestoneList(milestones: Milestone[], json: boolean): string`
       - JSON mode: `JSON.stringify(milestones, null, 2)`
       - Human mode: Table with columns [ID, Name, Status, Creator, Created]
       - Empty state: "No milestones found."
    
    3. `formatPhase(phase: Phase, json: boolean): string`
       - JSON mode: `JSON.stringify(phase, null, 2)`
       - Human mode: Multi-line showing ID, Number, Name, Milestone, Status, Description, Created, Completed
    
    4. `formatPhaseList(phases: Phase[], json: boolean): string`
       - JSON mode: `JSON.stringify(phases, null, 2)`
       - Human mode: Table with columns [#, Name, Status, Created]
       - Empty state: "No phases found."
    
    Import `Milestone` and `Phase` types from `../db/types.js`.
    
    - Do NOT modify existing formatter functions
    - Follow the exact same pattern as formatTask/formatTaskList
  </action>
  <verify>npx vitest run tests/milestone.test.ts tests/phase.test.ts</verify>
  <done>4 new formatter functions exported, all existing tests still pass</done>
</task>

<task type="auto">
  <name>Create milestone CLI commands</name>
  <files>src/cli/commands/milestone.ts, src/index.ts</files>
  <action>
    Create `src/cli/commands/milestone.ts` with `registerMilestoneCommands(program)`:

    1. `pm milestone create <id> <name>` — Create a new milestone
       - Options: `--goal <text>` (optional goal description)
       - Requires agent identity (resolveIdentity)
       - Calls `createMilestone(db, { id, name, goal, created_by: me.id })`
       - Output: JSON or "✓ Milestone 'id' created: \"name\""

    2. `pm milestone list` — List all milestones
       - Options: `--status <status>` (filter: planned, active, completed, archived)
       - No identity required
       - Calls `listMilestones(db, { status })`
       - Output: formatMilestoneList

    3. `pm milestone show <id>` — Show milestone details
       - No identity required
       - Calls `getMilestoneById(db, id)` — error if not found
       - Also calls `listPhases(db, id)` to show phases
       - Output: formatMilestone + phases table if any

    4. `pm milestone update <id>` — Update milestone fields
       - Options: `--name <name>`, `--goal <text>`, `--status <status>`
       - Requires agent identity (resolveIdentity)
       - Calls `updateMilestone(db, id, { name, goal, status })`
       - Output: JSON or "✓ Milestone 'id' updated"

    Register in `src/index.ts`:
    - Import `registerMilestoneCommands` 
    - Call `registerMilestoneCommands(program)` after existing registrations

    Follow the EXACT same error handling pattern as task.ts:
    - try/catch with `error instanceof Error` check
    - `process.exit(1)` on error
    - `db.close()` before successful exit
  </action>
  <verify>npx tsx src/index.ts milestone --help</verify>
  <done>4 milestone subcommands registered, --help shows all options</done>
</task>

<task type="auto">
  <name>Create phase CLI commands</name>
  <files>src/cli/commands/phase.ts, src/index.ts</files>
  <action>
    Create `src/cli/commands/phase.ts` with `registerPhaseCommands(program)`:

    1. `pm phase add <name>` — Add a phase to a milestone
       - Options: `--milestone <id>` (required — milestone to add to), `--number <n>` (phase number), `--description <text>`
       - If --milestone not provided, use getActiveMilestone(db) as default — error if none active
       - Requires agent identity (resolveIdentity — only to enforce identity, not used in addPhase)
       - Calls `addPhase(db, { milestone_id, number, name, description })`
       - Output: JSON or "✓ Phase #N added to milestone 'id'"

    2. `pm phase list` — List phases for a milestone
       - Options: `--milestone <id>` (defaults to active), `--status <status>`
       - No identity required
       - Calls `listPhases(db, milestone_id, { status })`
       - Output: formatPhaseList

    3. `pm phase show <id>` — Show phase details
       - No identity required
       - Calls `getPhaseById(db, parseInt(id))` — error if not found
       - Output: formatPhase

    4. `pm phase update <id>` — Update phase fields
       - Options: `--name <name>`, `--description <text>`, `--status <status>`
       - Requires agent identity
       - Calls `updatePhase(db, parseInt(id), { name, description, status })`
       - Output: JSON or "✓ Phase #id updated"

    Register in `src/index.ts`:
    - Import `registerPhaseCommands`
    - Call `registerPhaseCommands(program)` after milestone registration

    Note: Phase commands that need milestone context should resolve to active milestone when --milestone omitted.
  </action>
  <verify>npx tsx src/index.ts phase --help</verify>
  <done>4 phase subcommands registered, --help shows all options, active milestone fallback works</done>
</task>

## Success Criteria
- [ ] `pm milestone create|list|show|update` commands functional
- [ ] `pm phase add|list|show|update` commands functional
- [ ] Human-readable output with tables for list commands
- [ ] JSON output with `--json` flag for all commands
- [ ] All existing 179 tests still pass
