---
phase: 3
plan: 1
completed: 2026-03-01T06:55:00+07:00
---

# Summary: Cursor & Codex Adapters

## What Was Done

### Cursor Adapter (`src/core/install/adapters/cursor.ts`)
- Implements `ClientAdapter` interface
- **detect**: Checks for `.cursor/` directory or `.cursorignore` file
- **generate**: Creates `.cursor/rules/pm-guide.mdc` with MDC-format YAML frontmatter (`description`, `globs: "**/*"`, `alwaysApply: true`) + canonical template content
- **clean**: Removes `pm-guide.mdc` only, preserves `.cursor/` directory
- Registered as `cursor` adapter

### Codex Adapter (`src/core/install/adapters/codex.ts`)
- Implements `ClientAdapter` interface
- **detect**: Checks for `AGENTS.md` AND absence of `opencode.json` (disambiguates from OpenCode)
- **generate**: Creates/updates `AGENTS.md` with `<!-- pm-cli:start/end -->` section markers, same pattern as Claude Code adapter
- **clean**: Removes PM section from `AGENTS.md` using section markers; deletes file entirely if only PM content remains
- Registered as `codex` adapter

## Verification
- TypeScript compilation: ✅ `npx tsc --noEmit` — zero errors
- Both adapters follow established patterns from `antigravity.ts` and `claude-code.ts`
