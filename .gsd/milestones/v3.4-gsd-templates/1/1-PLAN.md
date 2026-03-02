---
phase: 1
plan: 1
wave: 1
gap_closure: false
---

# Plan 1.1: Template Loader & Content Helpers

## Objective
Create the foundational infrastructure that all subsequent domain changes will rely on:
1. A new `src/core/template_gsd.ts` module that reads and populates GSD templates.
2. Two new helper functions in `src/core/content.ts`: `writeMilestoneContent` and `writePhaseContent`.

This is pure new code — no existing behaviour changes. Fallback stubs ensure the system works even when `.gsd/templates/` doesn't exist.

## Context
- `.gsd/SPEC.md`
- `src/core/content.ts` — existing plan content helpers (pattern reference)
- `.gsd/templates/PLAN.md` — Plan template (variable reference)
- `.gsd/templates/milestone.md` — Milestone template (variable reference)
- `.gsd/templates/phase-summary.md` — Phase template (variable reference)

## Tasks

<task type="auto">
  <name>Create src/core/template_gsd.ts with template loaders and variable substitution</name>
  <files>
    src/core/template_gsd.ts
  </files>
  <action>
    Create a NEW file `src/core/template_gsd.ts` with the following exported functions:

    1. `loadGsdTemplate(projectRoot: string, templateName: string): string | null`
       - Looks for `<projectRoot>/.gsd/templates/<templateName>`.
       - If the file exists, reads and returns its content.
       - If the file does NOT exist, returns `null` (caller handles fallback).

    2. `populatePlanTemplate(raw: string, vars: { phaseNumber: number; planNumber: number; wave: number; name: string }): string`
       - Replace `{N}` with `phaseNumber`
       - Replace `{M}` with `planNumber`
       - Replace `{W}` with `wave`
       - Replace `{Descriptive Name}` with `name`
       - Also replace `Plan {N}.{M}:` with `Plan <phaseNumber>.<planNumber>:` in headings.
       - Return the populated string.

    3. `populateMilestoneTemplate(raw: string, vars: { id: string; name: string; date: string }): string`
       - Replace `{milestone-name}` with `id`
       - Replace `{name}` with `name` (everywhere it appears as a template variable)
       - Replace `[ISO timestamp]` with `date`
       - Replace `planning | active | complete | archived` with `planning`
       - Return the populated string.

    4. `populatePhaseTemplate(raw: string, vars: { phaseNumber: number; name: string; date: string }): string`
       - Replace `{N}` with `phaseNumber`
       - Replace `{Phase Name}` / `{What this phase set out to accomplish.}` with `name`
       - Replace `YYYY-MM-DD` with `date`
       - Return the populated string.

    USE: `fs.readFileSync` and `String.prototype.replaceAll()` for reliability.
    AVOID: regex with global flags that might corrupt content accidentally.

    The date passed by callers should be `new Date().toISOString().slice(0, 10)` (YYYY-MM-DD).
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `src/core/template_gsd.ts` exists and compiles without TypeScript errors.
    - All 4 functions are exported.
  </done>
</task>

<task type="auto">
  <name>Extend src/core/content.ts with writeMilestoneContent and writePhaseContent</name>
  <files>
    src/core/content.ts
  </files>
  <action>
    Add two new exported functions to the EXISTING `src/core/content.ts`, following the same patterns as `writePlanContent`:

    1. `writeMilestoneContent(projectRoot: string, milestoneId: string, content: string): void`
       - Target path: `<projectRoot>/.pm/milestones/<milestoneId>/MILESTONE.md`
       - Create intermediate dirs with `fs.mkdirSync({ recursive: true })`.
       - Write `content` with `fs.writeFileSync`.

    2. `writePhaseContent(projectRoot: string, milestoneId: string, phaseNumber: number, content: string): void`
       - Target path: `<projectRoot>/.pm/milestones/<milestoneId>/<phaseNumber>/PHASE.md`
       - Create intermediate dirs with `fs.mkdirSync({ recursive: true })`.
       - Write `content` with `fs.writeFileSync`.

    Also add corresponding read helpers for completeness (optional but good for symmetry):
    - `readMilestoneContent(projectRoot, milestoneId): string | null`
    - `readPhaseContent(projectRoot, milestoneId, phaseNumber): string | null`

    AVOID: changing any existing function signatures or behaviour.
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `src/core/content.ts` compiles with no errors.
    - `writeMilestoneContent` and `writePhaseContent` are exported.
  </done>
</task>

## Success Criteria
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Both new modules have no side-effects when imported (pure utility)
- [ ] Template loader returns `null` gracefully when `.gsd/templates/` is absent
