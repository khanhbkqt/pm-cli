---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Task CRUD Core Logic + Formatters

## Objective
Implement the core task management logic (add, list, get, update, assign, comment) and corresponding output formatters. This is the data/logic layer — no CLI wiring yet.

## Context
- .gsd/SPEC.md
- src/db/schema.ts — `tasks` and `task_comments` tables already exist
- src/db/types.ts — `Task` and `TaskComment` interfaces already defined
- src/core/agent.ts — Reference pattern for core logic (parameterized `db`, plain SQL, typed returns)
- src/output/formatter.ts — Reference pattern for formatters (`formatTable`, JSON toggle)

## Tasks

<task type="auto">
  <name>Create core/task.ts — task CRUD functions</name>
  <files>src/core/task.ts</files>
  <action>
    Create `src/core/task.ts` following the `core/agent.ts` pattern:

    1. `addTask(db, params: { title, description?, priority?, assigned_to?, parent_id?, created_by })` → Task
       - `created_by` is the resolved agent ID (mandatory)
       - Validate `created_by` agent exists in DB, throw if not
       - If `assigned_to` provided, validate agent exists
       - If `parent_id` provided, validate parent task exists
       - INSERT into tasks, return the created row
       - Default status='todo', priority='medium'

    2. `listTasks(db, filters?: { status?, assigned_to?, parent_id? })` → Task[]
       - Build WHERE clause dynamically from filters
       - ORDER BY created_at DESC
       - If no filters, return all tasks

    3. `getTaskById(db, id: number)` → Task | undefined
       - SELECT * FROM tasks WHERE id = ?

    4. `updateTask(db, id: number, updates: { title?, description?, status?, priority?, assigned_to? })` → Task
       - Validate task exists, throw if not
       - If `assigned_to` provided, validate agent exists
       - Build SET clause dynamically from non-undefined fields
       - Always SET updated_at = CURRENT_TIMESTAMP
       - Return updated row

    5. `assignTask(db, id: number, agentName: string, assignedBy: string)` → Task
       - Convenience wrapper: resolve agent by name, call updateTask
       - Validate both agent (assignee) and assigner exist

    6. `addComment(db, params: { task_id, agent_id, content })` → TaskComment
       - Validate task exists
       - Validate agent exists
       - INSERT into task_comments, return created row

    7. `getComments(db, taskId: number)` → TaskComment[]
       - SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at ASC
       - Validate task exists

    **What to avoid and WHY:**
    - Do NOT validate status transitions (DECISION-004: data integrity only)
    - Do NOT add permission checks (out of scope per SPEC)
    - Do NOT use an ORM (DECISION-008: plain SQL)
  </action>
  <verify>npx vitest run tests/task.test.ts</verify>
  <done>
    - All 7 functions exported from core/task.ts
    - Functions accept db as first param (consistent with agent.ts pattern)
    - Foreign key validations throw descriptive errors
    - Dynamic WHERE/SET clause building works correctly
  </done>
</task>

<task type="auto">
  <name>Add task & comment formatters to output/formatter.ts</name>
  <files>src/output/formatter.ts</files>
  <action>
    Extend `src/output/formatter.ts` with task formatting functions:

    1. `formatTask(task: Task, json: boolean)` → string
       - JSON mode: JSON.stringify
       - Human mode: Key-value display like formatAgent
       - Show: ID, Title, Status, Priority, Assigned To (or "unassigned"), Created By, Parent (or "none"), Created, Updated

    2. `formatTaskList(tasks: Task[], json: boolean)` → string
       - JSON mode: JSON.stringify array
       - Human mode: table using existing formatTable()
       - Columns: ID, Title, Status, Priority, Assigned To
       - Empty state: "No tasks found."

    3. `formatComment(comment: TaskComment, json: boolean)` → string
       - JSON mode: JSON.stringify
       - Human mode: `[timestamp] agent: content`

    4. `formatCommentList(comments: TaskComment[], json: boolean)` → string
       - JSON mode: JSON.stringify array
       - Human mode: sequential comment display
       - Empty state: "No comments."

    Import `Task` and `TaskComment` from `../db/types.js`.
  </action>
  <verify>npx tsx -e "import { formatTask, formatTaskList } from './src/output/formatter.js'; console.log('OK')"</verify>
  <done>
    - 4 new formatter functions exported
    - Both JSON and human-readable modes work
    - Consistent style with existing formatAgent/formatAgentList
  </done>
</task>

## Success Criteria
- [ ] `core/task.ts` exports all 7 CRUD functions
- [ ] `output/formatter.ts` exports 4 new task/comment formatters
- [ ] All functions follow established patterns (db first param, typed returns, descriptive errors)
