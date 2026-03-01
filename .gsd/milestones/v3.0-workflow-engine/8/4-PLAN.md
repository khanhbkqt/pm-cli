---
phase: 8
plan: 4
wave: 2
---

# Plan 8.4: Export Updates + Install CLI Refinements

## Objective
Update `src/core/install/index.ts` to re-export new modules. Ensure `pm install` CLI command works end-to-end with multi-file output.

## Context
- src/core/install/index.ts
- src/cli/commands/install.ts

## Tasks

<task type="auto">
  <name>Update install module exports</name>
  <files>src/core/install/index.ts</files>
  <action>
    Add re-exports for the new modules:
    - `export { loadWorkflowTemplates, getWorkflowsDir } from './template.js';`
    - `export { buildWorkflowIndex } from './workflow-index.js';`

    Only add new exports — do NOT modify existing ones.
  </action>
  <verify>npm run build</verify>
  <done>Build succeeds. New functions are accessible via `@/core/install`.</done>
</task>

<task type="auto">
  <name>Verify install CLI handles multi-file output display</name>
  <files>src/cli/commands/install.ts</files>
  <action>
    Review `handleInstallClient()` and `handleInstallAll()` — they already iterate `result.files` and display each path. Since adapters now return more files in their `GenerateResult.files` array, the CLI should display them all automatically.

    No code changes expected — just verify the existing display logic handles the increased file count correctly. If the output is too verbose (17 files for Antigravity), consider adding a summary line like "Installed {N} workflow files" after the file list.
  </action>
  <verify>npm run build</verify>
  <done>Build succeeds. Install CLI correctly displays multi-file results.</done>
</task>

## Success Criteria
- [ ] `npm run build` succeeds
- [ ] New functions exported from install module index
- [ ] CLI output handles 15+ files gracefully
