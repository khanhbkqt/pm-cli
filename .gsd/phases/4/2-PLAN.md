---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Retrofit Milestone & Phase CLI for Workflow Transitions

## Objective
Wire `pm milestone update --status` and `pm phase update --status` through the workflow transition functions (`transitionMilestone`, `transitionPhase`) instead of raw CRUD. Add `--force` flag to both update commands. This ensures consistent status validation and cascading behavior across all entity types.

## Context
- .gsd/phases/4/RESEARCH.md (Q2: Workflow Integration)
- src/cli/commands/milestone.ts (current: uses raw updateMilestone for status)
- src/cli/commands/phase.ts (current: uses raw updatePhase for status)
- src/core/workflow.ts (transitionMilestone, transitionPhase)

## Tasks

<task type="auto">
  <name>Retrofit milestone update to use workflow transitions</name>
  <files>src/cli/commands/milestone.ts</files>
  <action>
    In `milestone.ts`:
    1. Add import: `import { transitionMilestone } from '../../core/workflow.js';`
    2. Add `--force` option to the update command: `.option('--force', 'Bypass transition validation')`
    3. In the update action, change status handling logic:

    ```typescript
    // If --status provided, route through workflow
    if (opts.status) {
        transitionMilestone(db, id, opts.status as any, { force: opts.force });
    }
    // Apply non-status updates via CRUD
    const otherUpdates: any = {};
    if (opts.name !== undefined) otherUpdates.name = opts.name;
    if (opts.goal !== undefined) otherUpdates.goal = opts.goal;
    if (Object.keys(otherUpdates).length > 0) {
        updateMilestone(db, id, otherUpdates);
    }
    // Fetch final state for output
    const updated = getMilestoneById(db, id)!;
    ```

    Avoid:
    - Don't change create, list, or show commands
    - Don't remove existing imports (updateMilestone is still used for non-status updates)
    - Keep existing error handling pattern
  </action>
  <verify>npx tsx -e "import { registerMilestoneCommands } from './src/cli/commands/milestone.js'; console.log('OK')"</verify>
  <done>Milestone update compiles, --status routes through transitionMilestone, --force flag available</done>
</task>

<task type="auto">
  <name>Retrofit phase update to use workflow transitions</name>
  <files>src/cli/commands/phase.ts</files>
  <action>
    In `phase.ts`:
    1. Add import: `import { transitionPhase } from '../../core/workflow.js';`
    2. Add `--force` option to the update command: `.option('--force', 'Bypass transition validation')`
    3. In the update action, change status handling logic:

    ```typescript
    // If --status provided, route through workflow
    if (opts.status) {
        transitionPhase(db, parseInt(id, 10), opts.status as any, { force: opts.force });
    }
    // Apply non-status updates via CRUD
    const otherUpdates: any = {};
    if (opts.name !== undefined) otherUpdates.name = opts.name;
    if (opts.description !== undefined) otherUpdates.description = opts.description;
    if (Object.keys(otherUpdates).length > 0) {
        updatePhase(db, parseInt(id, 10), otherUpdates);
    }
    // Fetch final state for output
    const updated = getPhaseById(db, parseInt(id, 10))!;
    ```

    Avoid:
    - Don't change add, list, or show commands
    - Don't remove existing imports (updatePhase is still needed for non-status and for the show enhancement from Plan 4.1)
    - Don't break existing phase update tests
  </action>
  <verify>npx tsx -e "import { registerPhaseCommands } from './src/cli/commands/phase.js'; console.log('OK')"</verify>
  <done>Phase update compiles, --status routes through transitionPhase, --force flag available</done>
</task>

## Success Criteria
- [ ] `pm milestone update --status active` validates transition via workflow
- [ ] `pm phase update --status in_progress` validates transition via workflow
- [ ] `--force` flag bypasses validation on both commands
- [ ] Non-status updates (--name, --goal, --description) still work via raw CRUD
- [ ] Combined updates (`--name X --status Y`) apply both correctly
