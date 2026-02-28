---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Antigravity Adapter

## Objective
Create the Antigravity client adapter that generates `.agent/workflows/*.md` files and `.gemini/` config from the canonical template.

## Context
- src/core/install/types.ts — ClientAdapter interface
- src/core/install/registry.ts — registration
- docs/agent-guide/AGENT_INSTRUCTIONS.md — canonical template
- .agent/workflows/*.md — existing workflow examples (this project uses Antigravity)

## Tasks

<task type="auto">
  <name>Implement Antigravity adapter</name>
  <files>src/core/install/adapters/antigravity.ts</files>
  <action>
    Create `src/core/install/adapters/antigravity.ts` implementing `ClientAdapter`:

    1. `detect(projectRoot)`:
       - Check for `.agent/` or `.gemini/` directories
       - Return true if either exists

    2. `generate(projectRoot, templatePath)`:
       - Create `.agent/workflows/pm-guide.md` with YAML frontmatter:
         ```yaml
         ---
         description: PM CLI agent workflow guide — command reference, usage patterns, and best practices
         ---
         ```
         Followed by the canonical template content
       - Create `.gemini/settings.json` if not exists, or update to include custom instruction reference
       - Return list of created files

    3. `clean(projectRoot)`:
       - Remove `.agent/workflows/pm-guide.md`
       - Do NOT remove `.agent/` or `.gemini/` directories (may have other files)

    4. `getConfig()`:
       - Return ClientConfig with paths and format info

    Register with `registerAdapter(ClientType.Antigravity, () => new AntigravityAdapter())`
  </action>
  <verify>npx tsc --noEmit src/core/install/adapters/antigravity.ts</verify>
  <done>Adapter compiles, implements all ClientAdapter methods</done>
</task>

<task type="auto">
  <name>Implement Claude Code adapter</name>
  <files>src/core/install/adapters/claude-code.ts</files>
  <action>
    Create `src/core/install/adapters/claude-code.ts` implementing `ClientAdapter`:

    1. `detect(projectRoot)`:
       - Check for `CLAUDE.md` or `.claude/` directory
       - Return true if either exists

    2. `generate(projectRoot, templatePath)`:
       - Create `CLAUDE.md` at project root
       - Format: plain markdown with sections
       - Prepend Claude Code-specific header:
         ```markdown
         # Project Rules

         ## PM CLI Integration

         This project uses `pm` CLI for project management. Follow these instructions when working on tasks.
         ```
       - Append canonical template content below
       - If `CLAUDE.md` already exists, look for `## PM CLI Integration` section and replace only that section (preserve user content)
       - Return list of created/modified files

    3. `clean(projectRoot)`:
       - If `CLAUDE.md` has only PM content, remove file
       - If `CLAUDE.md` has other content, remove only `## PM CLI Integration` section

    4. `getConfig()`:
       - Return ClientConfig with paths and format info

    Register with `registerAdapter(ClientType.ClaudeCode, () => new ClaudeCodeAdapter())`
  </action>
  <verify>npx tsc --noEmit src/core/install/adapters/claude-code.ts</verify>
  <done>Adapter compiles, handles CLAUDE.md creation and section-level updates</done>
</task>

## Success Criteria
- [ ] Antigravity adapter generates valid `.agent/workflows/pm-guide.md` with YAML frontmatter
- [ ] Claude Code adapter generates valid `CLAUDE.md` with section markers
- [ ] Both adapters handle existing files gracefully (update, not overwrite)
- [ ] Both adapters support clean/uninstall
- [ ] Both registered in adapter registry
