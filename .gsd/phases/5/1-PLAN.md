---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Install & Uninstall Scripts

## Objective
Create `scripts/install.sh` and `scripts/uninstall.sh` that build the project and use `npm link` / `npm unlink` to make the `pm` command available globally.

## Context
- .gsd/SPEC.md
- .gsd/phases/5/RESEARCH.md
- package.json (bin field: `"pm": "./dist/index.js"`)
- scripts/ (existing scripts for style reference)

## Tasks

<task type="auto">
  <name>Create scripts/install.sh</name>
  <files>scripts/install.sh</files>
  <action>
    Create a bash script that:
    1. Runs `npm run build` to compile TypeScript
    2. Runs `npm link` to create global symlink
    3. Verifies the `pm` command is accessible via `command -v pm`
    4. Prints success/failure with colored output
    5. Uses `set -e` for error handling
    6. Follow the existing script style (box banners with ╔═╗ chars, ✅/❌ emoji)
    - Do NOT use `sudo` — homebrew Node doesn't need it
    - Do NOT use `npm install -g .` — it copies instead of symlinking
  </action>
  <verify>bash -n scripts/install.sh && echo "syntax ok"</verify>
  <done>scripts/install.sh exists, is executable, has valid bash syntax</done>
</task>

<task type="auto">
  <name>Create scripts/uninstall.sh</name>
  <files>scripts/uninstall.sh</files>
  <action>
    Create a bash script that:
    1. Runs `npm unlink -g @pm-cli/pm` to remove the global symlink
    2. Verifies `pm` command is no longer accessible
    3. Prints success/failure with colored output
    4. Follow the existing script style (box banners, emoji)
    - Do NOT remove `dist/` — that's a build artifact, not an install artifact
    - Do NOT use `rm` on any npm prefix paths
  </action>
  <verify>bash -n scripts/uninstall.sh && echo "syntax ok"</verify>
  <done>scripts/uninstall.sh exists, is executable, has valid bash syntax</done>
</task>

## Success Criteria
- [ ] `scripts/install.sh` exists with valid bash syntax
- [ ] `scripts/uninstall.sh` exists with valid bash syntax
- [ ] Both scripts are executable (`chmod +x`)
- [ ] Both scripts use `set -e` and exit code checking
