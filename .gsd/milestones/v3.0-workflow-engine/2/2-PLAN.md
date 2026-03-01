---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: CLI Integration Tests

## Objective
Write CLI integration tests for the new milestone and phase commands, verifying end-to-end behavior through the actual CLI.

## Context
- .gsd/phases/2/1-PLAN.md — Plan 2.1 (prerequisite)
- tests/task-cli.test.ts — reference pattern (run/runExpectFail helpers)
- src/cli/commands/milestone.ts — milestone CLI commands
- src/cli/commands/phase.ts — phase CLI commands

## Tasks

<task type="auto">
  <name>Write milestone CLI integration tests</name>
  <files>tests/milestone-cli.test.ts</files>
  <action>
    Create `tests/milestone-cli.test.ts` following the pattern from `task-cli.test.ts`:

    Setup:
    - `run()` and `runExpectFail()` helpers using `npx tsx src/index.ts`
    - `beforeEach`: create temp dir, `pm init`, register agent "alice"
    - `afterEach`: cleanup temp dir

    Test cases:
    1. `pm milestone create` creates a milestone — verify output contains "created"
    2. `pm milestone create` without --agent shows identity error
    3. `pm milestone create` with --goal stores the goal
    4. `pm milestone list` shows created milestones  
    5. `pm milestone list --json` outputs valid JSON array
    6. `pm milestone list --status active` filters correctly
    7. `pm milestone show <id>` displays milestone details
    8. `pm milestone show` nonexistent shows error
    9. `pm milestone update <id> --status active` updates status
    10. `pm milestone show` after update shows phases section if any
  </action>
  <verify>npx vitest run tests/milestone-cli.test.ts</verify>
  <done>All milestone CLI tests pass, ~10 test cases</done>
</task>

<task type="auto">
  <name>Write phase CLI integration tests</name>
  <files>tests/phase-cli.test.ts</files>
  <action>
    Create `tests/phase-cli.test.ts` following the same pattern:

    Setup:
    - Same run/runExpectFail helpers
    - `beforeEach`: create temp dir, init project, register agent "alice", create milestone "v1" with --agent alice, update it to active

    Test cases:
    1. `pm phase add` adds a phase — verify output contains "added"
    2. `pm phase add` without --agent shows identity error
    3. `pm phase add` with --milestone flag targets specific milestone
    4. `pm phase add` without --milestone defaults to active milestone
    5. `pm phase list` shows phases for a milestone
    6. `pm phase list --json` outputs valid JSON array
    7. `pm phase list --status not_started` filters correctly
    8. `pm phase show <id>` displays phase details
    9. `pm phase show` nonexistent shows error
    10. `pm phase update <id> --status in_progress` updates status
  </action>
  <verify>npx vitest run tests/phase-cli.test.ts</verify>
  <done>All phase CLI tests pass, ~10 test cases</done>
</task>

## Success Criteria
- [ ] milestone-cli.test.ts — all tests pass
- [ ] phase-cli.test.ts — all tests pass
- [ ] Full suite (`npx vitest run`) — all tests pass (179 existing + ~20 new)
