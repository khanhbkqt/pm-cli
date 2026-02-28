---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Integration Tests & Documentation

## Objective
Write integration tests for the install system and update documentation.

## Context
- tests/init.test.ts — test pattern reference
- src/core/install/ — all install modules
- src/cli/commands/install.ts — CLI command
- docs/agent-guide/AGENT_INSTRUCTIONS.md — canonical template

## Tasks

<task type="auto">
  <name>Write integration tests for install system</name>
  <files>tests/install.test.ts, tests/install-detect.test.ts</files>
  <action>
    1. Create `tests/install-detect.test.ts`:
       - Test `detectClients()` with mocked filesystem:
         - Empty dir → no clients detected
         - Dir with `.agent/` → detects Antigravity
         - Dir with `CLAUDE.md` → detects Claude Code
         - Dir with `.cursor/` → detects Cursor
         - Dir with `AGENTS.md` → detects Codex (low confidence)
         - Dir with `opencode.json` → detects OpenCode
         - Dir with multiple markers → detects all, sorted by confidence

    2. Create `tests/install.test.ts`:
       - Test each adapter's `generate()` method:
         - Antigravity: creates `.agent/workflows/pm-guide.md` with YAML frontmatter
         - Claude Code: creates `CLAUDE.md` with PM section
         - Cursor: creates `.cursor/rules/pm-guide.mdc` with MDC frontmatter
         - Codex: creates `AGENTS.md` with PM section
         - OpenCode: creates `AGENTS.md` + `opencode.json`
       - Test existing file handling:
         - Claude Code: preserves existing CLAUDE.md content
         - Codex: preserves existing AGENTS.md content
       - Test `clean()` for each adapter:
         - Removes only PM-generated files
         - Preserves user files

    Use temp directories (same pattern as init.test.ts).
    Use vitest describe/it/expect pattern.
  </action>
  <verify>npx vitest run tests/install.test.ts tests/install-detect.test.ts</verify>
  <done>All install tests pass</done>
</task>

<task type="auto">
  <name>Update documentation and README</name>
  <files>docs/agent-guide/README.md, README.md</files>
  <action>
    1. Update `docs/agent-guide/README.md`:
       - Add section on multi-client installation
       - List supported clients with config format
       - Quick start: `pm install --detect` → `pm install <client>`

    2. Update `README.md`:
       - Add `pm install` to CLI reference section
       - Add "AI Client Integration" section listing supported clients
       - Update feature list to include multi-client support

    Keep changes minimal — just add the new command documentation.
  </action>
  <verify>cat docs/agent-guide/README.md | head -5 && cat README.md | grep -c "install"</verify>
  <done>README and agent guide updated with install documentation</done>
</task>

## Success Criteria
- [ ] All detection tests pass
- [ ] All adapter generate/clean tests pass
- [ ] Existing file preservation tests pass
- [ ] Documentation updated with install command reference
- [ ] `npm test` passes (all existing + new tests)
