---
phase: 6
plan: 2
wave: 1
---

# Plan 6.2: Update ARCHITECTURE.md with Workflow Engine

## Objective
ARCHITECTURE.md is outdated — it only documents the original v1.0 modules (task, agent, context). Add documentation for all v2.x/v3.0 modules: workflow engine, milestones, phases, plans, progress, install system.

## Context
- docs/ARCHITECTURE.md (current — missing workflow engine, install system)
- src/core/milestone.ts, src/core/phase.ts, src/core/plan.ts
- src/core/workflow.ts
- src/core/install/ (adapters, registry, template)
- src/cli/commands/milestone.ts, phase.ts, plan.ts, progress.ts, install.ts

## Tasks

<task type="auto">
  <name>Add workflow engine to Architecture doc</name>
  <files>docs/ARCHITECTURE.md</files>
  <action>
    1. In "CLI Layer" section, add new command files:
       - `commands/milestone.ts` — `pm milestone create|list|show|update|complete`
       - `commands/phase.ts` — `pm phase add|list|show|update`
       - `commands/plan.ts` — `pm plan create|list|show|update`
       - `commands/progress.ts` — `pm progress`
       - `commands/install.ts` — `pm install <client>`

    2. In "Core Layer" section, add new modules:
       - `milestone.ts` — Milestone CRUD
       - `phase.ts` — Phase management within milestones
       - `plan.ts` — Execution plan management within phases
       - `workflow.ts` — State machine (transitions, validation, cascading status)
       - `install/` — Multi-client adapter system (Antigravity, Claude Code, Cursor, Codex, OpenCode, Gemini CLI)

    3. In "Key Design Decisions", add:
       - GSD-inspired workflow engine — project lifecycle (milestones → phases → plans) with state machine transitions
       - Multi-client install — canonical template adapted to each AI client's native config format

    4. Update "Key Files Reference" table with new files.

    5. Optionally update the system diagram to show the install/workflow layer.
  </action>
  <verify>grep -c "milestone\|workflow\|install" docs/ARCHITECTURE.md # should be ≥ 10</verify>
  <done>ARCHITECTURE.md covers all v3.0 modules with accurate descriptions</done>
</task>

## Success Criteria
- [ ] ARCHITECTURE.md mentions milestone, phase, plan, workflow, progress, install modules
- [ ] Key Design Decisions updated
- [ ] Key Files Reference updated
