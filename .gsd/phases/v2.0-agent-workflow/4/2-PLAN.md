---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: End-to-End Verification

## Objective

Verify that an AI agent can follow the agent guide from zero to completing a task — proving the documentation is complete, accurate, and actionable.

## Context

- `docs/agent-guide/AGENT_INSTRUCTIONS.md` — Canonical instructions (from Plan 4.1)
- `docs/agent-guide/onboarding.md` — Onboarding steps (from Phase 3)
- `src/cli/commands/` — All CLI command source files

## Tasks

<task type="auto">
  <name>E2E Smoke Test Script</name>
  <files>docs/agent-guide/tests/e2e-smoke-test.sh</files>
  <action>
    Create `docs/agent-guide/tests/e2e-smoke-test.sh` — a bash script that follows the agent guide step-by-step:

    ```bash
    #!/bin/bash
    set -euo pipefail

    TMPDIR=$(mktemp -d)
    cd "$TMPDIR"

    echo "=== Step 1: Init project ==="
    pm init test-project

    echo "=== Step 2: Register agent ==="
    pm agent register test-bot --role developer --type ai --json

    echo "=== Step 3: Set identity ==="
    export PM_AGENT=test-bot

    echo "=== Step 4: Verify identity ==="
    pm agent whoami --json

    echo "=== Step 5: Check status ==="
    pm status --json

    echo "=== Step 6: Create task ==="
    pm task add "Implement feature X" --description "Test task" --priority high --json

    echo "=== Step 7: List tasks ==="
    pm task list --json

    echo "=== Step 8: Assign task ==="
    pm task assign 1 --to test-bot --json

    echo "=== Step 9: Update status ==="
    pm task update 1 --status in-progress --json

    echo "=== Step 10: Add comment ==="
    pm task comment 1 "Starting work on feature X" --json

    echo "=== Step 11: Set context ==="
    pm context set "test-key" "test-value" --category decision --json

    echo "=== Step 12: Get context ==="
    pm context get "test-key" --json

    echo "=== Step 13: Search context ==="
    pm context search "test" --json

    echo "=== Step 14: Complete task ==="
    pm task update 1 --status done --json

    echo "=== Step 15: Final status ==="
    pm status --json

    echo ""
    echo "✅ All steps passed!"

    # Cleanup
    rm -rf "$TMPDIR"
    ```

    The script must:
    - Use `-euo pipefail` for strict error handling
    - Run in a temp directory (no side effects)
    - Exercise every major command from the guide
    - Clean up after itself
    - Exit 0 on success, non-zero on any failure
  </action>
  <verify>test -f docs/agent-guide/tests/e2e-smoke-test.sh && head -1 docs/agent-guide/tests/e2e-smoke-test.sh | grep -q "#!/bin/bash" && echo "OK" || echo "FAIL"</verify>
  <done>Script exists, is executable, covers init → register → task CRUD → context → status</done>
</task>

<task type="checkpoint:human-verify">
  <name>Run E2E Smoke Test</name>
  <files>docs/agent-guide/tests/e2e-smoke-test.sh</files>
  <action>
    Run the smoke test and verify all 15 steps pass:
    ```bash
    chmod +x docs/agent-guide/tests/e2e-smoke-test.sh
    bash docs/agent-guide/tests/e2e-smoke-test.sh
    ```
    If any step fails, fix the corresponding documentation or test script.
  </action>
  <verify>bash docs/agent-guide/tests/e2e-smoke-test.sh && echo "PASS" || echo "FAIL"</verify>
  <done>All 15 steps pass with exit code 0 and "All steps passed!" message</done>
</task>

## Success Criteria

- [ ] E2E smoke test script exists and covers all major commands
- [ ] Script runs successfully in a clean temp directory
- [ ] Script exercises the complete agent guide workflow
