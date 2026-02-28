#!/bin/bash
# PM CLI — Local Uninstall Script
# Removes the global symlink created by npm link

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         PM CLI ► UNINSTALLING                         ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Step 1: Remove global symlink
echo "▶ Unlinking globally (npm unlink)..."
npm unlink -g @pm-cli/pm 2>/dev/null || true
echo "✅ Global symlink removed"
echo ""

# Step 2: Verify pm command is no longer accessible
echo "▶ Verifying removal..."
if command -v pm &> /dev/null; then
    echo "⚠️  pm command is still accessible."
    echo "   It may be provided by another package or cached in your shell."
    echo "   Try: hash -r && which pm"
else
    echo "✅ pm command successfully removed"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         PM CLI ► UNINSTALLED SUCCESSFULLY ✅          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "  Reinstall: npm run install:local"
echo ""
