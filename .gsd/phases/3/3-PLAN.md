---
phase: 3
plan: 3
wave: 3
---

# Plan 3.3: Task Management Tests

## Objective
Write comprehensive unit tests for `core/task.ts` and CLI integration tests for `pm task` commands. Follow the exact patterns established in `tests/agent.test.ts` and `tests/agent-cli.test.ts`.

## Context
- tests/agent.test.ts — Unit test pattern (in-memory DB, beforeEach/afterEach)
- tests/agent-cli.test.ts — CLI integration test pattern (run/runExpectFail helpers, tempDir)
- src/core/task.ts — Functions under test
- src/cli/commands/task.ts — CLI commands under test

## Tasks

<task type="auto">
  <name>Create tests/task.test.ts — unit tests for core/task.ts</name>
  <files>tests/task.test.ts</files>
  <action>
    Create `tests/task.test.ts` following `tests/agent.test.ts` pattern:

    Setup: tempDir + getDatabase + register a test agent ("tester") in beforeEach

    Test cases:
    1. `addTask` creates task with correct fields (title, status=todo, priority=medium, created_by)
    2. `addTask` with all optional fields (description, priority, parent_id)
    3. `addTask` throws if created_by agent doesn't exist
    4. `addTask` throws if parent_id task doesn't exist
    5. `listTasks` returns all tasks sorted by created_at DESC
    6. `listTasks` with status filter returns only matching tasks
    7. `listTasks` with assigned_to filter
    8. `getTaskById` returns task when found
    9. `getTaskById` returns undefined when not found
    10. `updateTask` updates title and bumps updated_at
    11. `updateTask` updates status
    12. `updateTask` throws if task doesn't exist
    13. `assignTask` sets assigned_to correctly
    14. `assignTask` throws if agent name doesn't exist
    15. `addComment` creates comment linked to task
    16. `addComment` throws if task doesn't exist
    17. `getComments` returns comments in chronological order
    18. `getComments` returns empty array for task with no comments
    19. Subtask: addTask with parent_id links to parent
  </action>
  <verify>npx vitest run tests/task.test.ts</verify>
  <done>
    - All 19 test cases pass
    - Tests cover happy paths + error paths
    - Tests follow same setup/teardown pattern as agent.test.ts
  </done>
</task>

<task type="auto">
  <name>Create tests/task-cli.test.ts — CLI integration tests</name>
  <files>tests/task-cli.test.ts</files>
  <action>
    Create `tests/task-cli.test.ts` following `tests/agent-cli.test.ts` pattern:

    Setup: tempDir + pm init + register agent "alice" in beforeEach
    Use same run() / runExpectFail() helpers

    Test cases:
    1. `pm task add "My task" --agent alice` creates task
    2. `pm task add` without --agent shows identity error
    3. `pm task list` shows created tasks (no identity required)
    4. `pm task list --json` outputs valid JSON array
    5. `pm task list --status todo` filters correctly
    6. `pm task show 1` shows task details
    7. `pm task show 999` shows not found error
    8. `pm task update 1 --status done --agent alice` updates task
    9. `pm task assign 1 --to alice --agent alice` assigns task
    10. `pm task comment 1 "Great work" --agent alice` adds comment
    11. `pm task show 1` after comment shows the comment
    12. `pm task add "Subtask" --parent 1 --agent alice` creates subtask
    13. `pm task list --json --assigned alice` filters by assigned agent
  </action>
  <verify>npx vitest run tests/task-cli.test.ts</verify>
  <done>
    - All 13 CLI integration tests pass
    - Tests verify both human-readable and JSON output
    - Tests verify identity enforcement on write ops
    - Tests verify error handling
  </done>
</task>

## Success Criteria
- [ ] `npx vitest run tests/task.test.ts` — all 19 tests pass
- [ ] `npx vitest run tests/task-cli.test.ts` — all 13 tests pass
- [ ] `npx vitest run` — all existing + new tests pass (no regressions)
