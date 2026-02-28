---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Context CRUD Core + Formatters

## Objective
Implement the context sharing core logic (`src/core/context.ts`) and output formatters (`src/output/formatter.ts`), following the exact patterns established by `task.ts` and `agent.ts`. The `context` table already exists in the schema, and the `ContextEntry` type is already defined in `src/db/types.ts`.

## Context
- .gsd/SPEC.md
- src/db/schema.ts — context table definition (key UNIQUE, category CHECK constraint)
- src/db/types.ts — ContextEntry interface
- src/core/task.ts — pattern to follow (requireAgent helper, CRUD functions)
- src/core/agent.ts — getAgentById used for validation
- src/output/formatter.ts — existing formatTable, formatAgent, formatTask, etc.

## Tasks

<task type="auto">
  <name>Create src/core/context.ts — Context CRUD functions</name>
  <files>src/core/context.ts</files>
  <action>
    Create `src/core/context.ts` with these exported functions, following the pattern in `src/core/task.ts`:

    1. `setContext(db, params: { key: string, value: string, category?: string, created_by: string }): ContextEntry`
       - Validate `created_by` agent exists (reuse the requireAgent pattern from task.ts or call getAgentById directly)
       - Use INSERT OR REPLACE to support upsert (key is UNIQUE)
       - Default category to 'note' if not provided
       - Return the inserted/updated row

    2. `getContext(db, key: string): ContextEntry | undefined`
       - Simple SELECT by key
       - Return undefined if not found

    3. `listContext(db, filters?: { category?: string }): ContextEntry[]`
       - SELECT all, optional WHERE category = ?
       - ORDER BY key ASC

    4. `searchContext(db, query: string): ContextEntry[]`
       - Use SQL LIKE with `%query%` on both key and value columns
       - ORDER BY key ASC

    Import only from `../db/types.js` and `./agent.js`.
    Do NOT create any new tables or modify the schema.
    Do NOT add a `deleteContext` function (not in SPEC).
  </action>
  <verify>npx tsx -e "import('./src/core/context.js')" — should compile without errors</verify>
  <done>
    - src/core/context.ts exists with 4 exported functions: setContext, getContext, listContext, searchContext
    - Each function has proper TypeScript types
    - Agent validation on setContext
    - No schema changes
  </done>
</task>

<task type="auto">
  <name>Add context formatters to src/output/formatter.ts</name>
  <files>src/output/formatter.ts</files>
  <action>
    Add two new exported functions to `src/output/formatter.ts`, following the pattern of `formatTask`/`formatTaskList`:

    1. `formatContext(entry: ContextEntry, json: boolean): string`
       - JSON mode: `JSON.stringify(entry, null, 2)`
       - Human mode: multi-line display showing Key, Value, Category, Creator, Created, Updated

    2. `formatContextList(entries: ContextEntry[], json: boolean): string`
       - JSON mode: `JSON.stringify(entries, null, 2)`
       - Human mode: use `formatTable` with headers ['Key', 'Value', 'Category', 'Creator']
       - Empty state: 'No context entries.'

    Import `ContextEntry` from `../db/types.js` (it's already imported in the file if done correctly; check if the import already includes it).
  </action>
  <verify>npx tsc --noEmit — src/output/formatter.ts compiles without type errors</verify>
  <done>
    - formatContext and formatContextList exported from formatter.ts
    - Both support json=true and json=false modes
    - Follows existing patterns exactly
  </done>
</task>

## Success Criteria
- [ ] `src/core/context.ts` exports setContext, getContext, listContext, searchContext
- [ ] `src/output/formatter.ts` exports formatContext, formatContextList
- [ ] `npx tsc --noEmit` passes with no errors
