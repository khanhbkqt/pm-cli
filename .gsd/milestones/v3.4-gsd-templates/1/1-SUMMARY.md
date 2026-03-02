---
phase: 1
plan: 1
status: completed
---

# Summary: Plan 1.1 — Template Loader & Content Helpers

## What Was Done

### Task 1: Created `src/core/template_gsd.ts`

New module with 4 exported functions:

- **`loadGsdTemplate(projectRoot, templateName)`** — reads `<projectRoot>/.gsd/templates/<templateName>`, returns `null` if absent (graceful fallback).
- **`populatePlanTemplate(raw, vars)`** — replaces `{N}`, `{M}`, `{W}`, `{Descriptive Name}` with actual values.
- **`populateMilestoneTemplate(raw, vars)`** — replaces `{milestone-name}`, `{name}`, `[ISO timestamp]`, and the status placeholder.
- **`populatePhaseTemplate(raw, vars)`** — replaces `{N}`, `{Phase Name}`, `{What this phase set out to accomplish.}`, `YYYY-MM-DD`.

All replacements use `String.prototype.replaceAll()` (no regex), pure utility — no side-effects on import.

### Task 2: Extended `src/core/content.ts`

Added 6 new exported functions following the existing `writePlanContent` / `readPlanContent` pattern:

- `getMilestoneContentPath` / `writeMilestoneContent` / `readMilestoneContent` → `.pm/milestones/<id>/MILESTONE.md`
- `getPhaseContentPath` / `writePhaseContent` / `readPhaseContent` → `.pm/milestones/<id>/<N>/PHASE.md`

## Verification

- `npx tsc --noEmit` → ✅ exit 0 (zero errors, both files)
- No existing functions modified or renamed

## Commit

`feat(phase-1): add template_gsd.ts loader and milestone/phase content helpers`
