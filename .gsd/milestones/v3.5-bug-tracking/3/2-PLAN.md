---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: CLI Integration Tests

## Objective
Write CLI integration tests for the `pm bug` commands following the `plan-cli.test.ts` pattern.

## Context
- tests/plan-cli.test.ts (reference test pattern)
- src/cli/commands/bug.ts (module under test)

## Tasks

<task type="auto">
  <name>Create bug-cli.test.ts</name>
  <files>tests/bug-cli.test.ts</files>
  <action>
    Create tests/bug-cli.test.ts using the execSync + tempDir pattern from plan-cli.test.ts:

    beforeEach: create tempDir, run `pm init`, `pm agent register`.

    Test cases:
    - pm bug report "Crash on login" creates a bug (output contains "Bug reported")
    - pm bug report without --agent shows identity error
    - pm bug report with --priority critical sets priority
    - pm bug report with --blocking sets blocking flag
    - pm bug list shows reported bugs
    - pm bug list --priority critical filters by priority
    - pm bug list --blocking shows only blocking bugs
    - pm --json bug list outputs valid JSON array
    - pm bug show <id> displays bug details
    - pm bug show nonexistent shows error
    - pm bug update <id> --status investigating updates status
    - pm bug update <id> --status resolved sets resolved_at
  </action>
  <verify>npx vitest run tests/bug-cli.test.ts</verify>
  <done>All CLI integration tests pass</done>
</task>

## Success Criteria
- [ ] tests/bug-cli.test.ts created with 10+ test cases
- [ ] All CLI tests pass via `npx vitest run tests/bug-cli.test.ts`
