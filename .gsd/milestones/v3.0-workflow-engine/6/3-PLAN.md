---
phase: 6
plan: 3
wave: 2
---

# Plan 6.3: Update README — GSD Methodology & Workflow CLI

## Objective
Update README.md to reflect that pm-cli inherits and implements the GSD (Get Shit Done) methodology. Add:
1. GSD methodology callout in overview
2. Workflow engine CLI commands (milestone, phase, plan, progress)
3. Agent workflow templates mention
4. Updated Key Features

## Context
- README.md
- .gsd/ROADMAP.md (milestone descriptions)
- PROJECT_RULES.md (GSD methodology reference)
- docs/agent-guide/workflows/ (15 workflow files)

## Tasks

<task type="auto">
  <name>Update README with GSD methodology and workflow CLI</name>
  <files>README.md</files>
  <action>
    1. **Key Features** — add two new entries:
       - 🔄 **Workflow Engine** — GSD-inspired lifecycle management (milestones → phases → plans) with state machine transitions
       - 📐 **Agent Workflow Templates** — 15 installable instruction files for plan/execute/verify patterns

    2. **GSD Methodology section** — add new section after "Key Features" (before Quick Start):
       ```markdown
       ## Built on GSD Methodology

       PM CLI implements the **Get Shit Done (GSD)** workflow engine — a structured
       lifecycle for managing projects from specification to delivery:

       **SPEC → PLAN → EXECUTE → VERIFY → COMMIT**

       - **Milestones** — top-level goals with tracking and completion
       - **Phases** — ordered chunks of work within a milestone
       - **Plans** — atomic execution units with verification criteria
       - **State Machine** — enforced status transitions prevent invalid workflows
       - **Agent Templates** — 15 workflow instruction files teach AI agents the lifecycle
       ```

    3. **CLI Reference** — add 4 new tables before the Install section:
       - Milestones: create, list, show, update, complete
       - Phases: add, list, show, update
       - Plans: create, list, show, update
       - Progress: progress

    4. Keep tone and formatting consistent with existing README style.
  </action>
  <verify>grep -c "GSD\|milestone\|phase\|plan\|progress" README.md # should be ≥ 15</verify>
  <done>README has GSD section, updated features, and complete workflow CLI reference</done>
</task>

## Success Criteria
- [ ] README mentions GSD methodology and the workflow lifecycle
- [ ] All 4 new command groups documented in CLI Reference
- [ ] Key Features includes workflow engine and agent templates
