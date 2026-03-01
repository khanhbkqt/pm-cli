---
phase: 8
plan: 2
wave: 1
---

# Plan 8.2: Directory-based Adapters (Antigravity + Cursor)

## Objective
Update Antigravity and Cursor adapters to write individual workflow files alongside the existing `pm-guide.md`. Update their `clean()` methods to remove all `pm-*.md`/`pm-*.mdc` files.

## Context
- src/core/install/adapters/antigravity.ts
- src/core/install/adapters/cursor.ts
- src/core/install/template.ts (loadWorkflowTemplates)

## Tasks

<task type="auto">
  <name>Update AntigravityAdapter generate() and clean()</name>
  <files>src/core/install/adapters/antigravity.ts</files>
  <action>
    1. Import `loadWorkflowTemplates` from `../template.js`

    2. In `generate()`, after the existing pm-guide.md and pm-cli.md writes, add a new section:
       - Call `loadWorkflowTemplates(projectRoot)` to get the Map
       - Iterate each entry: write content to `.agent/workflows/{filename}`
       - Workflow files already have correct `description:` frontmatter — write as-is
       - If file exists, push overwrite warning
       - Push each written path to `files[]`

    3. In `clean()`, after removing pm-guide.md and pm-cli.md, add:
       - Read `.agent/workflows/` directory
       - Filter for files matching `pm-*.md` (but NOT `pm-guide.md` which is already handled)
       - Delete each matching file and push to `removed[]`
       - Do NOT remove the directory itself

    4. Update `getConfig().configPaths` to include `'.agent/workflows/pm-*.md'`
  </action>
  <verify>npm run build</verify>
  <done>Build succeeds. AntigravityAdapter.generate() writes 15 workflow files + pm-guide.md + pm-cli.md.</done>
</task>

<task type="auto">
  <name>Update CursorAdapter generate() and clean()</name>
  <files>src/core/install/adapters/cursor.ts</files>
  <action>
    1. Import `loadWorkflowTemplates` from `../template.js`

    2. In `generate()`, after writing pm-guide.mdc, add:
       - Call `loadWorkflowTemplates(projectRoot)`
       - For each workflow file, transform to Cursor's `.mdc` format:
         - Replace the existing `description:` frontmatter with Cursor MDC frontmatter:
           ```
           ---
           description: {original description}
           globs: "**/*"
           alwaysApply: true
           ---
           ```
         - Write as `pm-{name}.mdc` to `.cursor/rules/`
       - If file exists, push overwrite warning

    3. In `clean()`, after removing pm-guide.mdc:
       - Scan `.cursor/rules/` for `pm-*.mdc` files (excluding `pm-guide.mdc` already handled)
       - Delete each and push to `removed[]`

    4. Update `getConfig().configPaths` to include `'.cursor/rules/pm-*.mdc'`
  </action>
  <verify>npm run build</verify>
  <done>Build succeeds. CursorAdapter.generate() writes 15 .mdc workflow files + pm-guide.mdc.</done>
</task>

## Success Criteria
- [ ] `npm run build` succeeds
- [ ] AntigravityAdapter generates 17 files total (pm-guide.md + pm-cli.md + 15 workflows)
- [ ] CursorAdapter generates 16 files total (pm-guide.mdc + 15 workflow .mdc files)
- [ ] Both clean() methods handle multi-file removal
