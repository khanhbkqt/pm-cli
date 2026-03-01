---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: Core Lifecycle Workflows (Must-Have)

## Objective
Create the 6 must-have workflow instruction files that cover the full project lifecycle — from planning through milestone completion. These are the essential workflows agents need to manage projects with `pm` CLI.

## Context
- .gsd/SPEC.md
- .gsd/phases/7/RESEARCH.md — Q1 (GSD mapping), Q5 (file structure), Q6 (validated CLI commands)
- docs/agent-guide/workflows/task-lifecycle.md — existing template for style/depth reference
- src/cli/commands/milestone.ts — milestone command signatures
- src/cli/commands/phase.ts — phase command signatures
- src/cli/commands/plan.ts — plan command signatures
- src/cli/commands/progress.ts — progress command signature

## Tasks

<task type="auto">
  <name>Create pm-plan-phase.md, pm-execute-phase.md, pm-verify-work.md</name>
  <files>
    docs/agent-guide/workflows/pm-plan-phase.md (new)
    docs/agent-guide/workflows/pm-execute-phase.md (new)
    docs/agent-guide/workflows/pm-verify-work.md (new)
  </files>
  <action>
    Create 3 workflow files following the structure from RESEARCH.md Q5:
    1. YAML frontmatter with `description` field only
    2. Objective section (what + when to use)
    3. Prerequisites section
    4. Numbered Steps with exact `pm` CLI commands in code blocks
    5. Cascading behavior section
    6. Success criteria
    7. Next steps (which workflow to run after)

    **pm-plan-phase.md**:
    - Steps: `pm phase list` to find target → `pm phase update <id> --status planning` → `pm plan create <name> --phase <id> --number <n>` for each plan → verify with `pm plan list --phase <id>`
    - Include wave assignment via `--wave` flag
    - Show `--json` output examples like task-lifecycle.md does
    - Cascade: mention that phase must be in `not_started` or `planning` status

    **pm-execute-phase.md**:
    - Steps: `pm plan list --phase <id>` → `pm plan update <id> --status in_progress` (start plan) → do work → `pm plan update <id> --status completed` → `pm progress` to track
    - Cascade: starting a plan auto-starts phase if `not_started`; completing all plans auto-completes phase
    - Show wave-based execution order (wave 1 first, then wave 2)

    **pm-verify-work.md**:
    - Steps: `pm progress` → verify each plan's deliverables → `pm plan update <id> --status completed` or `--status failed` → if failed, show retry path (`failed → pending`)
    - Cascade: all plans completed → phase auto-completes
    - Include proof requirements per change type (from GSD methodology)

    Include exact status values from Q6:
    - Phase: `not_started → planning → in_progress → completed`
    - Plan: `pending → in_progress → completed/failed`

    Do NOT use XML tags, allowed-tools, or Claude-specific formatting.
    Do NOT use `pm phase show <number>` — show takes DB integer ID, not phase number.
  </action>
  <verify>
    - Each file has YAML frontmatter with `description`
    - Each file contains `pm` commands in code blocks
    - No XML tags or Claude-specific directives
    - Status values match Q6 definitions
    - All `pm` command signatures match actual CLI (checked against RESEARCH.md Q6)
  </verify>
  <done>3 workflow files created in docs/agent-guide/workflows/ with correct pm commands and status transitions</done>
</task>

<task type="auto">
  <name>Create pm-progress.md, pm-new-milestone.md, pm-complete-milestone.md</name>
  <files>
    docs/agent-guide/workflows/pm-progress.md (new)
    docs/agent-guide/workflows/pm-new-milestone.md (new)
    docs/agent-guide/workflows/pm-complete-milestone.md (new)
  </files>
  <action>
    Create 3 workflow files using same structure.

    **pm-progress.md**:
    - Steps: `pm progress` (defaults to active milestone) → `pm progress --milestone <id>` for specific → `pm milestone show <id>` for details → `pm phase list` for phase breakdown
    - Show sample output interpretation
    - Include `--json` variant

    **pm-new-milestone.md**:
    - Steps: `pm milestone create <id> <name> --goal <text>` → `pm milestone update <id> --status active` → `pm phase add <name> --number <n> --milestone <id>`
    - Cascade: activating a milestone deactivates any currently-active one (single-active rule)
    - Include `--json` output examples

    **pm-complete-milestone.md**:
    - Steps: `pm progress` (verify all phases done) → `pm milestone update <id> --status completed` → optionally `pm milestone update <id> --status archived`
    - Cascade: completion requires all phases `completed` or `skipped` (unless `--force`)
    - Show `--force` flag usage for edge cases
    - Next steps: Create new milestone

    Do NOT use XML tags or Claude-specific formatting.
    Use exact command signatures from RESEARCH.md Q6.
  </action>
  <verify>
    - Each file has YAML frontmatter with `description`
    - Each file contains `pm` commands in code blocks
    - Status transitions match: milestone `planned → active → completed → archived`
    - All command signatures match actual CLI
  </verify>
  <done>3 workflow files created covering progress checking, milestone creation, and milestone completion</done>
</task>

## Success Criteria
- [ ] 6 must-have workflow files exist in `docs/agent-guide/workflows/`
- [ ] All files use consistent structure (frontmatter, objective, prerequisites, steps, cascading, success, next)
- [ ] All `pm` commands use correct signatures and status values
- [ ] No client-specific directives (XML tags, allowed-tools)
- [ ] Cascading behaviors documented where relevant
