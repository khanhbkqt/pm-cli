---
phase: 7
plan: 2
wave: 1
---

# Plan 7.2: Should-Have Workflows (Supporting Lifecycle)

## Objective
Create 4 should-have workflow files that support the core lifecycle — pre-planning discussion, pre-completion audit, session management (pause/resume), and phase management.

## Context
- .gsd/SPEC.md
- .gsd/phases/7/RESEARCH.md — Q1 (GSD mapping), Q5 (file structure), Q6 (validated CLI commands)
- docs/agent-guide/workflows/task-lifecycle.md — style reference
- docs/agent-guide/workflows/pm-plan-phase.md — created in Plan 7.1 (same-wave, style reference)

## Tasks

<task type="auto">
  <name>Create pm-discuss-phase.md, pm-audit-milestone.md</name>
  <files>
    docs/agent-guide/workflows/pm-discuss-phase.md (new)
    docs/agent-guide/workflows/pm-audit-milestone.md (new)
  </files>
  <action>
    **pm-discuss-phase.md**:
    - Purpose: Pre-planning discussion to clarify scope before creating plans
    - Steps: `pm phase show <id>` → review description and scope → `pm context set <key> <value>` to record decisions → proceed to `/pm-plan-phase`
    - Light touch — mostly about reviewing and context-setting, not status changes
    - Include when to skip (simple phases with clear scope)

    **pm-audit-milestone.md**:
    - Purpose: Pre-completion audit to check all phases are done
    - Steps: `pm progress` → `pm phase list --milestone <id>` → for each incomplete phase, `pm phase show <id>` → decide: complete, skip, or fix → `pm phase update <id> --status skipped` for out-of-scope phases
    - Show how to use `--force` on milestone completion vs. proper cleanup
    - Next steps: `pm-complete-milestone.md`

    Same file structure as Plan 7.1 files.
    No XML tags, no client-specific directives.
  </action>
  <verify>
    - Each file has YAML frontmatter with `description`
    - Each file contains `pm` commands in code blocks
    - No client-specific directives
  </verify>
  <done>2 workflow files created for pre-planning discussion and pre-completion audit</done>
</task>

<task type="auto">
  <name>Create pm-pause.md, pm-resume.md, pm-add-phase.md</name>
  <files>
    docs/agent-guide/workflows/pm-pause.md (new)
    docs/agent-guide/workflows/pm-resume.md (new)
    docs/agent-guide/workflows/pm-add-phase.md (new)
  </files>
  <action>
    **pm-pause.md**:
    - Purpose: Save session state before stopping work
    - Steps: `pm progress` → `pm context set session:last-phase <phase-id>` → `pm context set session:last-plan <plan-id>` → `pm context set session:notes "<summary>"` → document current state
    - Light workflow — mostly about dumping context for later retrieval
    - Mention: don't leave plans in `in_progress` state unless resuming soon

    **pm-resume.md**:
    - Purpose: Restore context and resume from where you left off
    - Steps: `pm progress` → `pm context get session:last-phase` → `pm context get session:notes` → `pm plan list --phase <id>` → find next pending plan → continue with `pm-execute-phase.md`
    - Show how to recover from incomplete plans (check for `in_progress` plans)

    **pm-add-phase.md**:
    - Purpose: Add a new phase to the active milestone
    - Steps: `pm phase list` (see existing phases) → `pm phase add <name> --number <n> --milestone <id> --description <text>` → verify with `pm phase list`
    - Note: number determines ordering; use gaps or append at end
    - Cascade: new phase starts as `not_started`

    Same structure. No client-specific directives.
  </action>
  <verify>
    - All 3 files have YAML frontmatter with `description`
    - All files contain `pm` commands in code blocks
    - Context commands use correct `pm context set/get` syntax
    - No client-specific directives
  </verify>
  <done>3 workflow files created for pause, resume, and add-phase</done>
</task>

## Success Criteria
- [ ] 5 should-have workflow files exist in `docs/agent-guide/workflows/`
- [ ] Consistent structure with Plan 7.1 files
- [ ] All `pm` commands use correct signatures
- [ ] Session management (pause/resume) uses `pm context` for state persistence
