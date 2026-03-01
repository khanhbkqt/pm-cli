---
phase: 8
plan: 3
wave: 2
---

# Plan 8.3: Section-based Adapters (Claude Code, Codex, OpenCode, Gemini CLI)

## Objective
Update the 4 section-based adapters to include a workflow index table inside their PM section markers. Agents using these clients will see the index and know which workflows are available.

## Context
- src/core/install/adapters/claude-code.ts
- src/core/install/adapters/codex.ts
- src/core/install/adapters/opencode.ts
- src/core/install/adapters/gemini-cli.ts
- src/core/install/workflow-index.ts (buildWorkflowIndex from Plan 8.1)

## Tasks

<task type="auto">
  <name>Update all 4 section-based adapters to include workflow index</name>
  <files>
    src/core/install/adapters/claude-code.ts
    src/core/install/adapters/codex.ts
    src/core/install/adapters/opencode.ts
    src/core/install/adapters/gemini-cli.ts
  </files>
  <action>
    For each of the 4 adapters:

    1. Import `loadWorkflowTemplates` from `../template.js`
    2. Import `buildWorkflowIndex` from `../workflow-index.js`

    3. In `generate()`, modify the PM block construction:
       - After `const templateContent = loadCanonicalTemplate(projectRoot);`
       - Add: `const workflows = loadWorkflowTemplates(projectRoot);`
       - Add: `const workflowIndex = buildWorkflowIndex(workflows);`
       - Append `workflowIndex` to the template content before wrapping in section markers:
         ```typescript
         const pmBlock = [SECTION_START, SECTION_HEADER + templateContent + '\n\n' + workflowIndex, SECTION_END].join('\n');
         ```

    4. No changes needed to `clean()` — removing the `pm-cli:start/end` section already removes everything including the index.

    Pattern is identical across all 4 files — keep consistent.
  </action>
  <verify>npm run build</verify>
  <done>Build succeeds. All 4 section-based adapters include workflow index in their PM section.</done>
</task>

## Success Criteria
- [ ] `npm run build` succeeds
- [ ] Claude Code's CLAUDE.md contains workflow index table inside pm-cli markers
- [ ] Codex's AGENTS.md contains workflow index table inside pm-cli markers
- [ ] OpenCode's AGENTS.md contains workflow index table inside pm-cli markers
- [ ] Gemini CLI's GEMINI.md contains workflow index table inside pm-cli markers
