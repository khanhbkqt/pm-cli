---
phase: 2
plan: 1
wave: 1
gap_closure: false
---

# Plan 2.1: Domain Logic — Milestone, Phase & Plan Template Generation

## Objective
Update the three core domain modules — `milestone.ts`, `phase.ts`, and `plan.ts` — to automatically generate comprehensive Markdown files from GSD templates when entities are created. The SQLite DB stays lean; the filesystem file carries full context.

## Context
- `src/core/template_gsd.ts` — template loaders from Phase 1
- `src/core/content.ts` — `writeMilestoneContent`, `writePhaseContent`, `writePlanContent` from Phase 1
- `src/core/milestone.ts` — `createMilestone` function to update
- `src/core/phase.ts` — `addPhase` function to update
- `src/core/plan.ts` — `createPlan` function to update
- `.gsd/templates/PLAN.md`
- `.gsd/templates/milestone.md`
- `.gsd/templates/phase-summary.md`

## Tasks

<task type="auto">
  <name>Update createMilestone to generate MILESTONE.md from template</name>
  <files>
    src/core/milestone.ts
  </files>
  <action>
    Update the `createMilestone` function signature to accept an optional `projectRoot?: string` parameter.

    After the DB insert (when `projectRoot` is provided):
    1. Call `loadGsdTemplate(projectRoot, 'milestone.md')`.
    2. If template is returned, call `populateMilestoneTemplate(raw, { id, name, date: new Date().toISOString().slice(0, 10) })`.
    3. If template returns `null`, use a minimal fallback stub:
       ```
       # Milestone: <name>
       
       **ID**: <id>
       **Status**: planning
       **Created**: <date>
       
       ## Goal
       <!-- Add milestone goal here -->
       
       ## Must-Haves
       - [ ] <!-- Add must-haves -->
       ```
    4. Call `writeMilestoneContent(projectRoot, id, content)`.

    Add necessary imports: `loadGsdTemplate`, `populateMilestoneTemplate` from `'./template_gsd.js'`; `writeMilestoneContent` from `'./content.js'`.

    AVOID: changing the DB logic, return type, or any other existing behaviour.
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    TypeScript compiles. `createMilestone` accepts `projectRoot` and writes the file when provided.
  </done>
</task>

<task type="auto">
  <name>Update addPhase to generate PHASE.md from template, and createPlan to always use template</name>
  <files>
    src/core/phase.ts
    src/core/plan.ts
  </files>
  <action>
    ### phase.ts — addPhase
    Update `addPhase` params to include `projectRoot?: string`.

    After the DB insert (when `projectRoot` is provided):
    1. Look up the milestone ID from the DB (it's already in `params.milestone_id`).
    2. Call `loadGsdTemplate(projectRoot, 'phase-summary.md')`.
    3. If template found, call `populatePhaseTemplate(raw, { phaseNumber: number, name, date })`.
    4. If `null`, use minimal stub:
       ```
       # Phase <N>: <name>
       
       **Status**: Not Started
       **Created**: <date>
       
       ## Objective
       <!-- Describe what this phase achieves -->
       
       ## Plans
       <!-- Plans will be listed here as they are created -->
       ```
    5. Call `writePhaseContent(projectRoot, milestone_id, number, content)`.

    ### plan.ts — createPlan
    In `createPlan`, after the DB insert:
    - If `content` is NOT provided by the caller, auto-load the template:
      1. If `projectRoot` is provided, load `loadGsdTemplate(projectRoot, 'PLAN.md')`.
      2. If found, get phase context from DB: `SELECT number, milestone_id FROM phases WHERE id = phase_id`.
      3. Call `populatePlanTemplate(raw, { phaseNumber: phase.number, planNumber: number, wave: wave ?? 1, name })`.
      4. If template not found, use minimal stub:
         ```
         ---
         phase: <N>
         plan: <M>
         wave: <W>
         ---
         
         # Plan <N>.<M>: <name>
         
         ## Objective
         <!-- Describe the plan objective -->
         
         ## Tasks
         <!-- Add tasks here -->
         
         ## Success Criteria
         - [ ] <!-- Add criteria -->
         ```
      5. Write the populated content via `writePlanContent`.
    - If content IS provided by the caller, use it as-is (existing behaviour).

    Add necessary imports in both files.

    AVOID: changing any return types or DB logic.
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    Both files compile. `addPhase` writes PHASE.md when `projectRoot` is given. `createPlan` auto-populates from template when no content is provided.
  </done>
</task>

## Success Criteria
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `createMilestone` generates `.pm/milestones/<id>/MILESTONE.md` when `projectRoot` passed
- [ ] `addPhase` generates `.pm/milestones/<id>/<num>/PHASE.md` when `projectRoot` passed
- [ ] `createPlan` generates `.pm/milestones/<id>/<phase>/<num>-PLAN.md` always when `projectRoot` passed
- [ ] Template variables are substituted correctly (no raw `{N}` or `{name}` placeholders left in output)
