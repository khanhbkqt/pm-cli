---
phase: 8
plan: 1
wave: 1
---

# Plan 8.1: Template Loader + Workflow Index Utility

## Objective
Add `loadWorkflowTemplates()` and `getWorkflowsDir()` to `template.ts`, and create a shared `workflow-index.ts` utility that builds a markdown index table from workflow file frontmatter. These are foundation pieces used by all adapters.

## Context
- src/core/install/template.ts
- docs/agent-guide/workflows/pm-*.md
- .gsd/phases/8/RESEARCH.md

## Tasks

<task type="auto">
  <name>Add loadWorkflowTemplates() and getWorkflowsDir() to template.ts</name>
  <files>src/core/install/template.ts</files>
  <action>
    Add two new exported functions after the existing `loadCanonicalTemplate()`:

    1. `getWorkflowsDir(projectRoot?: string): string` — Same lookup order as `getTemplatePath()`:
       - Try `{projectRoot}/docs/agent-guide/workflows/` first
       - Fallback to `{packageRoot}/docs/agent-guide/workflows/`
       - Throw if neither exists

    2. `loadWorkflowTemplates(projectRoot?: string): Map<string, string>` — Uses `getWorkflowsDir()`, reads all `pm-*.md` files via `readdirSync` + filter, returns `Map<filename, content>`.

    Do NOT change existing functions — only append new ones.
  </action>
  <verify>npm run build</verify>
  <done>Build succeeds. `loadWorkflowTemplates()` and `getWorkflowsDir()` are exported from template.ts.</done>
</task>

<task type="auto">
  <name>Create workflow-index.ts shared utility</name>
  <files>src/core/install/workflow-index.ts</files>
  <action>
    Create a new file `src/core/install/workflow-index.ts` with:

    1. `buildWorkflowIndex(workflows: Map<string, string>): string` — Parses YAML frontmatter from each workflow file to extract `description:`, then generates a markdown table:

    ```
    ## Available Workflows

    | Workflow | Description |
    |----------|-------------|
    | pm-plan-phase | Create execution plans for a phase |
    | pm-execute-phase | Execute plans within a phase |
    ...
    ```

    Use simple regex to extract `description:` from frontmatter — no external YAML parser dependency.
    Sort entries alphabetically by filename.
  </action>
  <verify>npm run build</verify>
  <done>Build succeeds. `buildWorkflowIndex()` is exported from workflow-index.ts.</done>
</task>

## Success Criteria
- [ ] `loadWorkflowTemplates()` returns Map with 15 entries
- [ ] `getWorkflowsDir()` resolves correctly from project root
- [ ] `buildWorkflowIndex()` generates valid markdown table
- [ ] `npm run build` succeeds
