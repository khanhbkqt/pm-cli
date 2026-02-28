---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Agent Data Layer

## Objective
Create the core agent CRUD functions that interact with the SQLite `agents` table. This is the foundation for all agent commands — no CLI wiring yet, just pure data operations.

## Context
- .gsd/SPEC.md
- src/db/schema.ts — agents table already exists (id, name, role, type, created_at)
- src/db/types.ts — Agent interface already defined
- src/db/connection.ts — getDatabase/createDatabase already exist
- src/core/init.ts — reference pattern for core module structure

## Tasks

<task type="auto">
  <name>Create agent core module</name>
  <files>src/core/agent.ts</files>
  <action>
    Create `src/core/agent.ts` with these functions:
    
    1. `registerAgent(db, { name, role, type })` — Insert new agent into agents table
       - Generate `id` using nanoid or crypto.randomUUID()
       - Validate: name must be unique (handle UNIQUE constraint error gracefully)
       - Validate: type must be 'human' or 'ai'
       - Return the created Agent object

    2. `listAgents(db)` — Return all agents ordered by created_at DESC
       - Return Agent[] array

    3. `getAgentByName(db, name)` — Find agent by name
       - Return Agent | undefined
       - Used for identity resolution

    4. `getAgentById(db, id)` — Find agent by ID
       - Return Agent | undefined
       - Used for FK validation in later phases

    All functions take `Database.Database` as first argument (same pattern as connection.ts).
    Use prepared statements (db.prepare().run/get/all).
    Do NOT use any ORM — plain SQL per DECISION-008.
    Do NOT add any npm dependencies — use crypto.randomUUID() from Node.js built-in.
  </action>
  <verify>npx tsx -e "import { registerAgent, listAgents, getAgentByName } from './src/core/agent.js'; console.log('✓ agent module compiles')"</verify>
  <done>src/core/agent.ts exists with 4 exported functions: registerAgent, listAgents, getAgentByName, getAgentById</done>
</task>

<task type="auto">
  <name>Create agent core tests</name>
  <files>tests/agent.test.ts</files>
  <action>
    Create `tests/agent.test.ts` following the pattern in tests/init.test.ts:
    - Use temp directory with beforeEach/afterEach cleanup
    - Create a fresh database using getDatabase() for each test

    Test cases:
    1. `registerAgent` creates agent with correct fields
    2. `registerAgent` rejects duplicate name (throws Error)
    3. `registerAgent` rejects invalid type (not 'human'/'ai')
    4. `listAgents` returns all agents sorted by created_at DESC
    5. `getAgentByName` returns agent when found
    6. `getAgentByName` returns undefined when not found
    7. `getAgentById` returns agent when found
  </action>
  <verify>npx vitest run tests/agent.test.ts</verify>
  <done>All 7 test cases pass with `npx vitest run tests/agent.test.ts`</done>
</task>

## Success Criteria
- [ ] `src/core/agent.ts` exports 4 functions
- [ ] 7 tests pass in `tests/agent.test.ts`
- [ ] No new npm dependencies added
