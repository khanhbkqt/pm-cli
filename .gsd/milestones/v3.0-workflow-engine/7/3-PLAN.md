---
phase: 7
plan: 3
wave: 2
---

# Plan 7.3: Nice-to-Have Workflows + Verification

## Objective
Create 4 nice-to-have utility workflow files and verify all 15 workflow files are consistent, accurate, and installable.

## Context
- .gsd/SPEC.md
- .gsd/phases/7/RESEARCH.md — Q1 (GSD mapping), Q6 (validated CLI commands)
- docs/agent-guide/workflows/ — all files from Plans 7.1 and 7.2

## Tasks

<task type="auto">
  <name>Create pm-new-project.md, pm-debug.md, pm-add-todo.md, pm-check-todos.md</name>
  <files>
    docs/agent-guide/workflows/pm-new-project.md (new)
    docs/agent-guide/workflows/pm-debug.md (new)
    docs/agent-guide/workflows/pm-add-todo.md (new)
    docs/agent-guide/workflows/pm-check-todos.md (new)
  </files>
  <action>
    **pm-new-project.md**:
    - Steps: `pm init` → `pm milestone create <id> <name> --goal <text>` → `pm milestone update <id> --status active` → `pm phase add <name> --number 1 --description <text>`
    - End-to-end project bootstrap flow
    - Next steps: `pm-plan-phase.md`

    **pm-debug.md**:
    - Steps: `pm task add "Debug: <issue>" --priority high` → investigate → `pm context set debug:<key> <findings>` → `pm task update <id> --status done` when resolved
    - Show how to track debugging sessions via tasks and context

    **pm-add-todo.md**:
    - Steps: `pm task add "<todo>" --priority low` → optionally `--description <details>`
    - Quick capture workflow, minimal steps

    **pm-check-todos.md**:
    - Steps: `pm task list --status todo --json` → parse and review → pick one → `pm task assign <id> --to <agent> --agent <agent>`
    - Show filtering and prioritization

    Same structure. Shorter files than core lifecycle (these are simpler workflows).
    No client-specific directives.
  </action>
  <verify>
    - All 4 files have YAML frontmatter with `description`
    - All files contain `pm` commands in code blocks
    - No client-specific directives
  </verify>
  <done>4 utility workflow files created</done>
</task>

<task type="auto">
  <name>Cross-verify all 15 workflow files for consistency and accuracy</name>
  <files>docs/agent-guide/workflows/pm-*.md</files>
  <action>
    Verify across ALL 15 new pm-* workflow files:

    1. **Structure consistency**: Every file has: YAML frontmatter → Objective → Prerequisites (if any) → Steps → Success Criteria → Next Steps
    2. **Command accuracy**: All `pm` commands match signatures from RESEARCH.md Q6
    3. **Status values**: All status values match Q6 transitions exactly
    4. **Cross-references**: "Next Steps" sections reference correct workflow filenames
    5. **No client-specific content**: No XML tags, no `allowed-tools`, no provider-specific instructions
    6. **Cascading behaviors**: Documented where relevant (auto-start phase, auto-complete, single-active rule)
    7. **Phase ID warning**: Files that use `pm phase show` correctly note it takes DB integer ID, not phase number

    Fix any inconsistencies found.
  </action>
  <verify>
    - grep all pm-*.md files for XML tags (expect 0 matches)
    - grep for `allowed-tools` (expect 0 matches)
    - grep for `description:` in frontmatter of each file (expect 15 matches)
    - Spot-check 3 files for correct command signatures
  </verify>
  <done>All 15 workflow files verified as consistent, accurate, and client-agnostic</done>
</task>

## Success Criteria
- [ ] 4 nice-to-have workflow files exist in `docs/agent-guide/workflows/`
- [ ] Total of 15 new `pm-*.md` files in `docs/agent-guide/workflows/`
- [ ] All files pass cross-verification checks
- [ ] No XML tags or client-specific content in any file
- [ ] All cross-references between workflow files are correct
