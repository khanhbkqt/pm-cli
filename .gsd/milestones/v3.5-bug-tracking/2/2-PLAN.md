---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Bug Core Tests

## Objective
Write comprehensive unit tests for `src/core/bug.ts` following the `plan.test.ts` pattern.

## Context
- tests/plan.test.ts (reference test pattern)
- src/core/bug.ts (module under test)

## Tasks

<task type="auto">
  <name>Create bug.test.ts</name>
  <files>tests/bug.test.ts</files>
  <action>
    Create tests/bug.test.ts using vitest with tempDir + in-memory DB pattern from plan.test.ts:

    beforeEach: create tempDir, open DB, register agent, create milestone + phase (for linking).

    Test cases:
    - reportBug creates with correct defaults (status=open, priority=medium, blocking=0)
    - reportBug with projectRoot writes template to .pm/bugs/<id>.md
    - reportBug with all options (priority, description, milestone_id, phase_id, blocking)
    - listBugs returns all bugs ordered by priority then created_at
    - listBugs with priority filter
    - listBugs with status filter
    - listBugs with blocking filter
    - getBugById returns bug when found
    - getBugById returns undefined when not found
    - getBugContent reads from filesystem
    - updateBug updates title and description
    - updateBug sets resolved_at when status changes to resolved
    - updateBug sets resolved_at when status changes to closed
    - updateBug throws if bug not found
    - getBlockingBugs returns only open blocking bugs
    - getBlockingBugs scoped to milestone
  </action>
  <verify>npx vitest run tests/bug.test.ts</verify>
  <done>All bug.test.ts tests pass</done>
</task>

## Success Criteria
- [ ] tests/bug.test.ts created with 15+ test cases
- [ ] All tests pass via `npx vitest run tests/bug.test.ts`
