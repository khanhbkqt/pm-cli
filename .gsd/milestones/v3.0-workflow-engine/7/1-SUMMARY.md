---
phase: 7
plan: 1
wave: 1
status: completed
---

# Plan 7.1 Summary

## What Was Done

Created 6 must-have workflow instruction files in `docs/agent-guide/workflows/`:

1. **pm-plan-phase.md** — Break a phase into plans with wave-based ordering
2. **pm-execute-phase.md** — Execute plans through pending → in_progress → completed
3. **pm-verify-work.md** — Validate deliverables with empirical evidence
4. **pm-progress.md** — Check milestone/phase/plan progress
5. **pm-new-milestone.md** — Create and activate a new milestone
6. **pm-complete-milestone.md** — Finalize and optionally archive a milestone

## Key Decisions

- All files follow consistent structure: YAML frontmatter (description only), Objective/When to Use, Prerequisites, Steps with exact `pm` commands, Cascading Behavior, Success Criteria, Next Steps
- Phase show ID warning included where relevant
- Exact status values from workflow.ts used throughout
- No XML tags or client-specific directives

## Verification

- All 6 files created with YAML frontmatter
- All use correct `pm` CLI command signatures from RESEARCH.md Q6
- No client-specific formatting
