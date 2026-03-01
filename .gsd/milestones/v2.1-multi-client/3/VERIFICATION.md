## Phase 3 Verification

### Must-Haves
- [x] Cursor adapter generates valid `.cursor/rules/pm-guide.mdc` with MDC frontmatter — VERIFIED (correct YAML frontmatter with description, globs, alwaysApply fields)
- [x] Codex adapter generates valid `AGENTS.md` with section markers — VERIFIED (uses `<!-- pm-cli:start/end -->` markers matching Claude Code pattern)
- [x] Both handle existing files gracefully — VERIFIED (Cursor overwrites with warning; Codex replaces section or appends)
- [x] Both support clean/uninstall — VERIFIED (Cursor removes .mdc file; Codex removes section or deletes file)
- [x] Both registered in adapter registry — VERIFIED (registerAdapter calls at module bottom)

### Verdict: PASS
