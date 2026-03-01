---
phase: 8
plan: 5
wave: 3
---

# Plan 8.5: Integration Tests

## Objective
Create integration tests for the template loader and adapter multi-file behavior to verify correctness and catch regressions.

## Context
- src/core/install/template.ts
- src/core/install/workflow-index.ts
- src/core/install/adapters/*.ts
- docs/agent-guide/workflows/pm-*.md

## Tasks

<task type="auto">
  <name>Create template and workflow-index unit tests</name>
  <files>src/core/install/template.test.ts</files>
  <action>
    Create `src/core/install/template.test.ts` with vitest:

    1. Test `loadWorkflowTemplates()`:
       - Returns a Map with 15 entries
       - All keys match `pm-*.md` pattern
       - All values are non-empty strings
       - All values contain `description:` in frontmatter

    2. Test `getWorkflowsDir()`:
       - Returns path ending in `docs/agent-guide/workflows`
       - Returned directory exists on disk

    3. Test `buildWorkflowIndex()` (import from workflow-index):
       - Given a Map of workflow files, returns markdown with `## Available Workflows` header
       - Contains a table with `| Workflow | Description |` headers
       - Contains one row per workflow entry
  </action>
  <verify>npx vitest run src/core/install/template.test.ts</verify>
  <done>All tests pass. Template loader and workflow index utility are verified.</done>
</task>

<task type="auto">
  <name>Create adapter multi-file integration tests</name>
  <files>src/core/install/adapters/adapters.test.ts</files>
  <action>
    Create `src/core/install/adapters/adapters.test.ts` with vitest:

    Test the Antigravity adapter in a temp directory:
    1. Call `generate()` on a temp projectRoot
    2. Assert `.agent/workflows/pm-guide.md` exists
    3. Assert 15 `pm-*.md` workflow files exist in `.agent/workflows/`
    4. Assert `.agent/rules/pm-cli.md` exists
    5. Call `clean()` and assert all pm-* files are removed

    Test the Cursor adapter in a temp directory:
    1. Call `generate()` on a temp projectRoot
    2. Assert `pm-guide.mdc` exists in `.cursor/rules/`
    3. Assert 15 `pm-*.mdc` workflow files exist in `.cursor/rules/`
    4. Each `.mdc` file has `alwaysApply: true` in frontmatter
    5. Call `clean()` and assert all pm-* files are removed

    Test a section-based adapter (Claude Code) in a temp directory:
    1. Call `generate()` on a temp projectRoot
    2. Assert `CLAUDE.md` contains `## Available Workflows` section
    3. Assert the workflow index table has 15 rows
    4. Call `clean()` and assert PM section is removed

    Use `fs.mkdtempSync` for temp directories. Clean up in `afterEach`.
  </action>
  <verify>npx vitest run src/core/install/adapters/adapters.test.ts</verify>
  <done>All adapter tests pass. Multi-file install/uninstall verified for directory and section-based adapters.</done>
</task>

## Success Criteria
- [ ] `npx vitest run src/core/install/` — all tests pass
- [ ] Template loader tests verify 15 workflow files loaded
- [ ] Adapter tests verify multi-file write and clean
