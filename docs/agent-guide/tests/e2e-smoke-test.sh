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

echo "=== Step 6: Create milestone ==="
pm milestone create v1 --name "Version 1" --goal "Initial release" --json
echo ""

echo "=== Step 7: Create phase ==="
pm phase create "Setup" --milestone v1 --number 1 --json
echo ""

echo "=== Step 8: Create plan ==="
pm plan create "Implement feature X" --phase 1 --number 1 --content "Build the core feature" --json
echo ""

echo "=== Step 9: List plans ==="
pm plan list --phase 1 --json
echo ""

echo "=== Step 10: Show plan board ==="
pm plan board --phase 1
echo ""

echo "=== Step 11: Update plan status ==="
pm plan update 1 --status in_progress --json
echo ""

echo "=== Step 12: Set context ==="
pm context set "test-key" "test-value" --category decision --json
echo ""

echo "=== Step 13: Get context ==="
pm context get "test-key" --json
echo ""

echo "=== Step 14: Search context ==="
pm context search "test" --json
echo ""

echo "=== Step 15: Complete plan ==="
pm plan update 1 --status completed --json
echo ""

echo "=== Step 16: Final status ==="
pm status --json
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✅ All 16 steps passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
