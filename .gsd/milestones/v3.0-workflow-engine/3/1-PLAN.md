---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Workflow Engine — Transition Validation & Session State

## Objective

Create `src/core/workflow.ts` — the central workflow module that enforces valid status transitions for milestones, phases, and plans. Also implement `workflow_state` CRUD for session persistence. This module wraps existing CRUD without modifying their signatures.

## Context

- .gsd/phases/3/RESEARCH.md (transition maps, cascading rules)
- src/core/milestone.ts (existing CRUD — 5 functions)
- src/core/phase.ts (existing CRUD — 5 functions)
- src/core/plan.ts (existing CRUD — 4 functions)
- src/db/types.ts (Milestone, Phase, Plan, WorkflowState interfaces)

## Tasks

<task type="auto">
  <name>Create workflow.ts with transition maps and transition functions</name>
  <files>src/core/workflow.ts</files>
  <action>
    Create `src/core/workflow.ts` with:

    1. **Transition maps** (const objects with TypeScript union types):
       ```typescript
       const MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
           planned: ['active'],
           active: ['completed', 'archived'],
           completed: ['archived'],
           archived: [],
       };

       const PHASE_TRANSITIONS: Record<PhaseStatus, PhaseStatus[]> = {
           not_started: ['planning', 'in_progress', 'skipped'],
           planning: ['in_progress', 'skipped'],
           in_progress: ['completed', 'skipped'],
           completed: [],
           skipped: ['not_started'],
       };

       const PLAN_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
           pending: ['in_progress'],
           in_progress: ['completed', 'failed'],
           completed: [],
           failed: ['pending'],
       };
       ```

    2. **Type aliases** for status union types:
       ```typescript
       type MilestoneStatus = 'planned' | 'active' | 'completed' | 'archived';
       type PhaseStatus = 'not_started' | 'planning' | 'in_progress' | 'completed' | 'skipped';
       type PlanStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
       ```

    3. **`transitionMilestone(db, id, newStatus, opts?: { force?: boolean })`**:
       - Get current milestone via `getMilestoneById`
       - Validate transition (unless `force: true`)
       - If transitioning to `active`: find current active milestone and set to `planned` (single-active rule)
       - If transitioning to `completed`: check ALL phases are `completed` or `skipped`, throw if not
       - Delegate to `updateMilestone(db, id, { status: newStatus })`
       - Return updated Milestone

    4. **`transitionPhase(db, id, newStatus, opts?: { force?: boolean })`**:
       - Get current phase via `getPhaseById`
       - Validate transition (unless `force: true`)
       - Delegate to `updatePhase(db, id, { status: newStatus })`
       - Return updated Phase

    5. **`transitionPlan(db, id, newStatus, opts?: { force?: boolean })`**:
       - Get current plan via `getPlanById`
       - Validate transition (unless `force: true`)
       - **Cascading: plan → phase auto-start**: If plan goes `pending → in_progress` AND parent phase is `not_started`, auto-transition phase to `in_progress`
       - **Cascading: plan → phase auto-complete**: If plan goes to `completed`, check if ALL plans in same phase are now `completed`. If yes, auto-transition phase to `completed`
       - Delegate to `updatePlan(db, id, { status: newStatus })`
       - Return updated Plan

    6. **Helper `validateTransition(current, next, map, entityName)`**:
       - If transition not in map, throw: `Cannot transition {entityName} from '{current}' to '{next}'. Valid transitions: {validList}`

    **Important:**
    - Import from existing core modules, don't duplicate SQL
    - All transition functions take `Database.Database` as first arg (consistent with existing pattern)
    - Export all transition functions + type aliases
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>workflow.ts exports transitionMilestone, transitionPhase, transitionPlan, validateTransition, and 3 transition maps</done>
</task>

<task type="auto">
  <name>Add workflow_state CRUD functions</name>
  <files>src/core/workflow.ts</files>
  <action>
    Add to the same `src/core/workflow.ts`:

    1. **`getWorkflowState(db, key)`** → `string | undefined`:
       - Query `workflow_state` table by key
       - Return value or undefined if not found

    2. **`setWorkflowState(db, key, value, updated_by)`** → `WorkflowState`:
       - Upsert: INSERT OR REPLACE into `workflow_state`
       - Validate agent exists via `getAgentById`
       - Return the upserted row

    3. **`listWorkflowState(db)`** → `WorkflowState[]`:
       - Return all key-value pairs ordered by key

    **Important:**
    - Follow same pattern as other core modules (requireAgent, etc.)
    - Import WorkflowState type from db/types
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>workflow.ts additionally exports getWorkflowState, setWorkflowState, listWorkflowState</done>
</task>

<task type="auto">
  <name>Write unit tests for workflow module</name>
  <files>tests/workflow.test.ts</files>
  <action>
    Create `tests/workflow.test.ts` following the pattern in `tests/milestone.test.ts`:

    Test cases:

    **Transition validation:**
    - Valid milestone transitions: planned→active, active→completed, completed→archived
    - Invalid milestone transition: planned→completed (should throw with helpful message)
    - Valid phase transitions: not_started→planning→in_progress→completed
    - Invalid phase transition: not_started→completed (should throw)
    - Valid plan transitions: pending→in_progress→completed
    - Invalid plan transition: pending→completed (should throw)
    - Plan retry: failed→pending
    - Phase un-skip: skipped→not_started
    - Force flag bypasses validation

    **Cascading:**
    - Plan in_progress auto-starts phase (not_started → in_progress)
    - All plans completed auto-completes phase
    - Phase already in_progress: plan start doesn't re-trigger cascade

    **Milestone rules:**
    - Activating milestone deactivates current active
    - Completing milestone with incomplete phases throws
    - Only one active milestone at a time

    **Workflow state:**
    - setWorkflowState creates new key
    - setWorkflowState upserts existing key
    - getWorkflowState returns value
    - getWorkflowState returns undefined for missing key
    - listWorkflowState returns all entries

    Use same temp DB pattern: `beforeEach` creates DB + registers test agent, `afterEach` cleans up.
  </action>
  <verify>npx vitest run tests/workflow.test.ts</verify>
  <done>All workflow tests pass (transition validation, cascading, milestone rules, workflow state CRUD)</done>
</task>

## Success Criteria

- [ ] `src/core/workflow.ts` exports all transition + state functions
- [ ] `npx tsc --noEmit` compiles clean
- [ ] All workflow tests pass
- [ ] Existing tests still pass: `npx vitest run`
