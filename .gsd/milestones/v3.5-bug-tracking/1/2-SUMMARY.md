---
phase: 1
plan: 2
wave: 1
status: completed
---

# Plan 1.2 Summary: Content Layer & Bug Template

## Changes
- `src/core/content.ts`: Added 5 bug content helpers — `getBugContentPath`, `ensureBugDir`, `writeBugContent`, `readBugContent`, `deleteBugContent` for `.pm/bugs/<id>.md` layout
- `docs/templates/BUG.md`: Created structured template with frontmatter, summary, repro steps, expected/actual behavior, environment, investigation notes, resolution sections

## Verification
- `npx tsc --noEmit` — clean
- `test -f docs/templates/BUG.md` — exists
