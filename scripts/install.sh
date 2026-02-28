#!/bin/bash
# PM CLI — Local Install Script
# Builds the project and creates a global symlink via npm link

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         PM CLI ► INSTALLING LOCALLY                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Step 1: Build TypeScript
echo "▶ Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed. Fix errors and retry."
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 2: Create global symlink
echo "▶ Linking globally (npm link)..."
npm link
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm link failed."
    exit 1
fi
echo "✅ Global symlink created"
echo ""

# Step 3: Verify pm command is accessible
echo "▶ Verifying installation..."
if command -v pm &> /dev/null; then
    PM_VERSION=$(pm --version 2>/dev/null || echo "unknown")
    echo "✅ pm command is available (version: $PM_VERSION)"
else
    echo ""
    echo "❌ pm command not found after linking."
    echo "   You may need to restart your shell or check your PATH."
    exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         PM CLI ► INSTALLED SUCCESSFULLY ✅            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "  Usage:  pm --help"
echo "  Remove: npm run uninstall:local"
echo ""
