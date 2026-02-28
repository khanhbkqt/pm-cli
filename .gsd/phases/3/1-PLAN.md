---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Cursor & Codex Adapters

## Objective
Create Cursor and Codex client adapters that generate native configuration from the canonical template.

## Context
- src/core/install/types.ts — ClientAdapter interface
- src/core/install/adapters/antigravity.ts — reference adapter
- docs/agent-guide/AGENT_INSTRUCTIONS.md — canonical template

## Tasks

<task type="auto">
  <name>Implement Cursor adapter</name>
  <files>src/core/install/adapters/cursor.ts</files>
  <action>
    Create `src/core/install/adapters/cursor.ts` implementing `ClientAdapter`:

    1. `detect(projectRoot)`:
       - Check for `.cursor/` directory or `.cursorignore` file

    2. `generate(projectRoot, templatePath)`:
       - Create `.cursor/rules/pm-guide.mdc`
       - MDC format = YAML frontmatter + markdown body:
         ```yaml
         ---
         description: PM CLI agent workflow guide
         globs: "**/*"
         alwaysApply: true
         ---
         ```
         Followed by canonical template content
       - Create `.cursor/rules/` directory if it doesn't exist
       - Return list of created files

    3. `clean(projectRoot)`:
       - Remove `.cursor/rules/pm-guide.mdc`
       - Do NOT remove `.cursor/` directory

    Register with `registerAdapter(ClientType.Cursor, () => new CursorAdapter())`
  </action>
  <verify>npx tsc --noEmit src/core/install/adapters/cursor.ts</verify>
  <done>Adapter compiles, generates valid .mdc file with correct frontmatter</done>
</task>

<task type="auto">
  <name>Implement Codex adapter</name>
  <files>src/core/install/adapters/codex.ts</files>
  <action>
    Create `src/core/install/adapters/codex.ts` implementing `ClientAdapter`:

    1. `detect(projectRoot)`:
       - Check for `AGENTS.md` file (note: shared signal with OpenCode)
       - Lower confidence detection — Codex if AGENTS.md exists AND no `opencode.json`

    2. `generate(projectRoot, templatePath)`:
       - Create `AGENTS.md` at project root
       - Format: markdown with Codex-specific structure:
         ```markdown
         # Agents Guide

         ## PM CLI Integration

         {canonical template content}
         ```
       - If `AGENTS.md` already exists, look for `## PM CLI Integration` section and replace (same pattern as Claude Code)
       - Return list of created/modified files

    3. `clean(projectRoot)`:
       - Same section-removal pattern as Claude Code adapter

    Register with `registerAdapter(ClientType.Codex, () => new CodexAdapter())`
  </action>
  <verify>npx tsc --noEmit src/core/install/adapters/codex.ts</verify>
  <done>Adapter compiles, generates valid AGENTS.md with section markers</done>
</task>

## Success Criteria
- [ ] Cursor adapter generates valid `.cursor/rules/pm-guide.mdc` with MDC frontmatter
- [ ] Codex adapter generates valid `AGENTS.md` with section markers
- [ ] Both handle existing files gracefully
- [ ] Both support clean/uninstall
- [ ] Both registered in adapter registry
