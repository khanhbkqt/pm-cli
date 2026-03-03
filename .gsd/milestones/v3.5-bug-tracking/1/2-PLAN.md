---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Content Layer & Bug Template

## Objective
Add bug filesystem content helpers to `content.ts` and create the bug report template.

## Context
- src/core/content.ts
- docs/templates/BUG.md (new)

## Tasks

<task type="auto">
  <name>Add bug content helpers</name>
  <files>src/core/content.ts</files>
  <action>
    Add a new section "Bug content helpers" following the existing pattern (milestone/phase/plan helpers).
    Functions to add:
    - `getBugContentPath(projectRoot, bugId)` → `.pm/bugs/<bugId>.md`
    - `ensureBugDir(projectRoot)` → ensures `.pm/bugs/` exists
    - `writeBugContent(projectRoot, bugId, content)` → write to file
    - `readBugContent(projectRoot, bugId)` → read from file, return null if missing
    - `deleteBugContent(projectRoot, bugId)` → delete file if exists
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>5 bug content functions exported from content.ts, TS compiles clean</done>
</task>

<task type="auto">
  <name>Create bug report template</name>
  <files>docs/templates/BUG.md</files>
  <action>
    Create a Markdown template for bug reports with structured sections:
    - Frontmatter: title, priority, status, reported_by, timestamps
    - Summary (one-liner from title)
    - Reproduction Steps
    - Expected vs Actual Behavior
    - Environment
    - Investigation Notes (append-only section)
    - Resolution (filled when resolved)
    The template should use placeholders like {Title}, {Priority}, {Status}, {ReportedBy}, {Timestamp}.
  </action>
  <verify>test -f docs/templates/BUG.md</verify>
  <done>BUG.md template exists with all required sections</done>
</task>

## Success Criteria
- [ ] Bug content helpers in `content.ts` compile clean
- [ ] `docs/templates/BUG.md` template created with structured sections
- [ ] File layout uses `.pm/bugs/<bugId>.md`
