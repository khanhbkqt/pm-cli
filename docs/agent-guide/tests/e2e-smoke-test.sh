#!/bin/bash
set -euo pipefail

# PM CLI Agent Guide — E2E Smoke Test
# Follows the agent guide step-by-step to verify all commands work.
# Runs in a temp directory — no side effects on your project.

TMPDIR=$(mktemp -d)
trap "rm -rf \"$TMPDIR\"" EXIT
cd "$TMPDIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PM CLI — E2E Smoke Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "=== Step 1: Init project ==="
pm init test-project
echo ""

echo "=== Step 2: Register agent ==="
pm agent register test-bot --role developer --type ai --json
echo ""

echo "=== Step 3: Set identity ==="
export PM_AGENT=test-bot
echo "PM_AGENT=$PM_AGENT"
echo ""

echo "=== Step 4: Verify identity ==="
pm agent whoami --json
echo ""

echo "=== Step 5: Check status ==="
pm status --json
echo ""

echo "=== Step 6: Create task ==="
pm task add "Implement feature X" --description "Test task" --priority high --json
echo ""

echo "=== Step 7: List tasks ==="
pm task list --json
echo ""

echo "=== Step 8: Assign task ==="
pm task assign 1 --to test-bot --json
echo ""

echo "=== Step 9: Update status ==="
pm task update 1 --status in-progress --json
echo ""

echo "=== Step 10: Add comment ==="
pm task comment 1 "Starting work on feature X" --json
echo ""

echo "=== Step 11: Set context ==="
pm context set "test-key" "test-value" --category decision --json
echo ""

echo "=== Step 12: Get context ==="
pm context get "test-key" --json
echo ""

echo "=== Step 13: Search context ==="
pm context search "test" --json
echo ""

echo "=== Step 14: Complete task ==="
pm task update 1 --status done --json
echo ""

echo "=== Step 15: Final status ==="
pm status --json
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ All 15 steps passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
