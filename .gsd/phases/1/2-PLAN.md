---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Workflow Core Model Functions

## Objective

Create core CRUD functions for milestones, phases, and plans — following the exact same patterns as existing `src/core/task.ts` and `src/core/agent.ts`. These functions will be used by CLI commands in Phase 2.

## Context

- src/db/schema.ts (updated with workflow tables)
- src/db/types.ts (Milestone, Phase, Plan, WorkflowState interfaces)
- src/core/task.ts (pattern reference — CRUD functions with DB param)
- src/core/agent.ts (pattern reference — validation helpers)
- tests/task.test.ts (test pattern reference — vitest, temp DB setup)

## Tasks

<task type="auto">
  <name>Create milestone core module</name>
  <files>src/core/milestone.ts</files>
  <action>
    Create `src/core/milestone.ts` following the patterns in task.ts:

    Functions to implement:
    1. `createMilestone(db, params: { id: string, name: string, goal?: string, created_by: string }): Milestone`
       - Validate created_by agent exists (reuse pattern from task.ts)
       - INSERT and return the created row

    2. `listMilestones(db, filters?: { status?: string }): Milestone[]`
       - Optional status filter
       - Order by created_at DESC

    3. `getMilestoneById(db, id: string): Milestone | undefined`

    4. `updateMilestone(db, id: string, updates: { name?: string, goal?: string, status?: string }): Milestone`
       - Only update provided fields
       - Set completed_at = CURRENT_TIMESTAMP when status changes to 'completed'
       - Validate milestone exists, throw if not found

    5. `getActiveMilestone(db): Milestone | undefined`
       - Return the milestone with status = 'active' (there should be at most one)

    **Pattern rules:**
    - Import Database type from 'better-sqlite3'
    - Import types from '../db/types.js'
    - Use `db.prepare(...).run/get/all` directly (no ORM)
    - Throw descriptive Error messages on validation failures
  </action>
  <verify>npx tsc --noEmit src/core/milestone.ts</verify>
  <done>milestone.ts exports 5 functions, compiles clean, follows existing CRUD patterns</done>
</task>

<task type="auto">
  <name>Create phase and plan core modules</name>
  <files>src/core/phase.ts, src/core/plan.ts</files>
  <action>
    Create `src/core/phase.ts`:

    1. `addPhase(db, params: { milestone_id: string, number: number, name: string, description?: string }): Phase`
       - Validate milestone exists
       - INSERT and return
    2. `listPhases(db, milestone_id: string, filters?: { status?: string }): Phase[]`
       - Filter by milestone_id (required), optional status filter
       - Order by number ASC
    3. `getPhaseById(db, id: number): Phase | undefined`
    4. `updatePhase(db, id: number, updates: { name?: string, description?: string, status?: string }): Phase`
       - Set completed_at when status → 'completed'
    5. `getPhaseByNumber(db, milestone_id: string, number: number): Phase | undefined`

    Create `src/core/plan.ts`:

    1. `createPlan(db, params: { phase_id: number, number: number, name: string, wave?: number, content?: string }): Plan`
       - Validate phase exists
    2. `listPlans(db, phase_id: number, filters?: { status?: string, wave?: number }): Plan[]`
       - Order by wave ASC, number ASC
    3. `getPlanById(db, id: number): Plan | undefined`
    4. `updatePlan(db, id: number, updates: { name?: string, status?: string, content?: string, wave?: number }): Plan`
       - Set completed_at when status → 'completed'

    **Pattern rules:** Same as milestone.ts — direct SQL, descriptive errors.
  </action>
  <verify>npx tsc --noEmit src/core/phase.ts src/core/plan.ts</verify>
  <done>phase.ts exports 5 functions, plan.ts exports 4 functions, all compile clean</done>
</task>

<task type="auto">
  <name>Write unit tests for workflow models</name>
  <files>tests/milestone.test.ts, tests/phase.test.ts, tests/plan.test.ts</files>
  <action>
    Create test files following the exact pattern in tests/task.test.ts:

    **Setup pattern** (copy from task.test.ts):
    - beforeEach: create temp dir, init DB with getDatabase, register a test agent
    - afterEach: close DB, remove temp dir

    **tests/milestone.test.ts** — test createMilestone, listMilestones, getMilestoneById, updateMilestone, getActiveMilestone:
    - Create with valid params → returns correct fields
    - Create with invalid agent → throws
    - List with/without status filter
    - Update status to completed → sets completed_at
    - getActiveMilestone returns only active milestone

    **tests/phase.test.ts** — test addPhase, listPhases, getPhaseById, updatePhase, getPhaseByNumber:
    - Create phase linked to milestone → correct fields
    - Create with non-existent milestone → throws
    - List phases in order by number
    - Update status to completed → sets completed_at
    - getPhaseByNumber returns correct phase

    **tests/plan.test.ts** — test createPlan, listPlans, getPlanById, updatePlan:
    - Create plan linked to phase → correct fields
    - Create with non-existent phase → throws
    - List plans ordered by wave, then number
    - Update status to completed → sets completed_at

    **Important:**
    - Each test must have its own describe block
    - Tests must be independent (no shared state between tests)
    - Use the same import style as task.test.ts
  </action>
  <verify>npx vitest run tests/milestone.test.ts tests/phase.test.ts tests/plan.test.ts</verify>
  <done>All 3 test files pass, covering CRUD + validation + edge cases for all workflow models</done>
</task>

## Success Criteria

- [ ] `src/core/milestone.ts` — 5 exported CRUD functions
- [ ] `src/core/phase.ts` — 5 exported CRUD functions
- [ ] `src/core/plan.ts` — 4 exported CRUD functions
- [ ] All 3 test files pass: `npx vitest run tests/milestone.test.ts tests/phase.test.ts tests/plan.test.ts`
- [ ] Full test suite still passes: `npx vitest run`
