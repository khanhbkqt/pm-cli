---
phase: 3
plan: 1
wave: 1
gap_closure: false
---

# Plan 3.1: CLI Passthrough & Tests

## Objective
Wire `projectRoot` into the `pm milestone create` and `pm phase add` CLI handlers so they pass it down to the core functions updated in Phase 2. Then add/update tests to verify the full end-to-end template generation for all three entity types.

## Context
- `src/cli/commands/milestone.ts` — CLI handler for `pm milestone create`
- `src/cli/commands/phase.ts` — CLI handler for `pm phase add`
- `src/core/identity.ts` — `findProjectRoot` utility
- `tests/milestone.test.ts`
- `tests/phase.test.ts`
- `tests/plan.test.ts` (or `tests/plan-cli.test.ts`)
- `.gsd/milestones/v3.4-gsd-templates/1/1-PLAN.md` — For understanding template logic
- `.gsd/milestones/v3.4-gsd-templates/2/1-PLAN.md` — For understanding domain changes

## Tasks

<task type="auto">
  <name>Pass projectRoot to createMilestone and addPhase in CLI handlers</name>
  <files>
    src/cli/commands/milestone.ts
    src/cli/commands/phase.ts
  </files>
  <action>
    ### milestone.ts — pm milestone create handler
    Import `findProjectRoot` from `'../../core/identity.js'`.
    In the `create` action, before calling `createMilestone`, add:
    ```ts
    const projectRoot = findProjectRoot();
    ```
    Pass `projectRoot` to `createMilestone(db, { id, name, goal, created_by: me.id, projectRoot })`.
    Update the success message to mention the generated file:
    ```
    ✓ Milestone '<id>' created: "<name>"
      MILESTONE.md → .pm/milestones/<id>/MILESTONE.md
    ```

    ### phase.ts — pm phase add handler
    Import `findProjectRoot` from `'../../core/identity.js'` (if not already present).
    In the `add` action, add:
    ```ts
    const projectRoot = findProjectRoot();
    ```
    Pass `projectRoot` to `addPhase(db, { milestone_id, number, name, description, projectRoot })`.
    Update the success message:
    ```
    ✓ Phase #<num> added to milestone '<milestoneId>'
      PHASE.md → .pm/milestones/<milestoneId>/<num>/PHASE.md
    ```

    AVOID: changing any error handling or other option behaviour.
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    Both CLI handlers compile. `findProjectRoot` is imported and `projectRoot` is passed through correctly.
  </done>
</task>

<task type="auto">
  <name>Add/update tests for template generation in milestone, phase, and plan</name>
  <files>
    tests/milestone.test.ts
    tests/phase.test.ts
    tests/plan.test.ts
  </files>
  <action>
    ### tests/milestone.test.ts
    Add a test: `'createMilestone generates MILESTONE.md from template when projectRoot provided'`
    Setup:
    1. Create a temp `.gsd/templates/` dir.
    2. Write a minimal `milestone.md` template with `{name}`, `{milestone-name}`, `[ISO timestamp]`.
    3. Call `createMilestone(db, { id: 'v1.0', name: 'Test MS', created_by: testAgent.id, projectRoot: tempDir })`.
    4. Read `.pm/milestones/v1.0/MILESTONE.md` from `tempDir`.
    5. Assert file exists and contains `Test MS` (not `{name}`).

    Also add: `'createMilestone generates fallback stub when no template'`
    - Call without `.gsd/templates/` existing.
    - Assert file still written with minimal stub content.

    ### tests/phase.test.ts
    Add a test: `'addPhase generates PHASE.md from template when projectRoot provided'`
    Setup:
    1. Create milestone first.
    2. Write a minimal `phase-summary.md` template with `{N}`, YYYY-MM-DD.
    3. Call `addPhase(db, { milestone_id, number: 1, name: 'Foundation', projectRoot: tempDir })`.
    4. Assert `.pm/milestones/<id>/1/PHASE.md` exists and contains `Foundation`.

    ### tests/plan.test.ts (or closest test file for plan)
    Add a test: `'createPlan auto-generates PLAN.md from template when no content provided'`
    - Setup standard milestone + phase.
    - Write a minimal `PLAN.md` template with `{N}`, `{M}`, `{W}`, `{Descriptive Name}`.
    - Call `createPlan(db, { phase_id, number: 1, name: 'My Plan', wave: 1, projectRoot: tempDir })`.
    - Assert file written and variables substituted.

    Run all tests to ensure zero regressions:
    ```
    npx vitest run
    ```

    AVOID: modifying existing test logic, only ADD new test cases.
  </action>
  <verify>
    npx vitest run
  </verify>
  <done>
    All tests pass. New tests confirm template file generation for Milestone, Phase, and Plan.
  </done>
</task>

## Success Criteria
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npx vitest run` — all tests pass (no regressions)
- [ ] `pm milestone create v1.0 "Test"` → generates `.pm/milestones/v1.0/MILESTONE.md`
- [ ] `pm phase add "Phase 1" --number 1` → generates `.pm/milestones/<active>/1/PHASE.md`
- [ ] `pm plan create "My Plan" --phase <id> --number 1` → generates `1-PLAN.md` with no raw `{N}` placeholders
