---
phase: 5
level: 1
researched_at: 2026-02-28
---

# Phase 5 Research

## Questions Investigated
1. How to install an npm package globally from source without publishing?
2. Does the `pm` binary name conflict with anything on this system?
3. Are the existing `package.json` bin and tsup shebang configs sufficient?

## Findings

### npm link

`npm link` creates a global symlink to the local package. It reads the `bin` field from `package.json` and creates symlinks in the global `bin` directory.

**Workflow:**
```bash
npm run build        # compile TS → dist/index.js
npm link             # symlink package globally → creates `pm` command
```

**Uninstall:**
```bash
npm unlink -g @pm-cli/pm
```

**Recommendation:** Use `npm link` — it's the standard approach, no extra tooling needed.

### Binary Name Conflict Check

```
$ which pm → "pm not found"
$ npm prefix -g → /opt/homebrew
```

**Result:** No `pm` binary exists on this system. Safe to use.

### Existing Config Readiness

| Config | Status | Detail |
|--------|--------|--------|
| `package.json` bin | ✅ | `"pm": "./dist/index.js"` |
| tsup shebang | ✅ | `#!/usr/bin/env node` injected via banner |
| ESM module type | ✅ | `"type": "module"` |
| Node target | ✅ | `node18` (current: v24.14.0) |

**Result:** No changes needed — existing config is sufficient for `npm link`.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Install method | `npm link` | Standard, no extra deps, reversible |
| Script format | bash (.sh) | macOS/Linux target, simple |
| Script location | `scripts/` | Follows common project convention |

## Patterns to Follow
- Build before link to ensure `dist/` is fresh
- Check exit codes in scripts for error handling
- Use color output for user feedback

## Anti-Patterns to Avoid
- `npm install -g .` — copies files instead of symlinking (stale on code changes)
- Manual PATH manipulation — fragile, user-specific

## Dependencies Identified

None — `npm link` is built into npm.

## Risks
- **Permission errors on global npm:** Mitigated by using homebrew Node (no sudo needed)
- **Stale build after code changes:** Script always runs `npm run build` first

## Ready for Planning
- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
