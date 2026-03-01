## Plan 6.1 Summary

### What Was Done

1. **Integration tests for install system** — Created two comprehensive test files:
   - `tests/install-detect.test.ts` (10 tests): empty directory detection, per-client signature detection (Antigravity, Claude Code, Cursor, Codex, OpenCode, Gemini CLI), multi-client detection with confidence sorting, OpenCode high/low confidence disambiguation.
   - `tests/install.test.ts` (25 tests): generate/clean for all 6 adapters, YAML frontmatter, MDC frontmatter, section marker handling, existing file preservation (Claude Code, Codex, OpenCode, Gemini CLI), safe cleanup that preserves user files and parent directories.

2. **Documentation updates**:
   - `docs/agent-guide/README.md`: Replaced future-tense "For Client Integration" placeholder with fully documented "Multi-Client Installation" section listing all 6 clients, commands, and config formats.
   - `README.md`: Added "Multi-Client Install" feature bullet, new "AI Client Integration" section with usage examples and client table, and "Install" subsection in CLI Reference.

### Commits
- `feat(phase-6): add integration tests for install system`
- `feat(phase-6): update documentation with install command reference`
