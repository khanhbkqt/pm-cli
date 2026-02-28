# Plan 2.1 Summary: Agent Data Layer

## Completed
- Created `src/core/agent.ts` with 4 exported functions:
  - `registerAgent(db, { name, role, type })` — insert with UUID, unique name + type validation
  - `listAgents(db)` — all agents ordered by created_at DESC
  - `getAgentByName(db, name)` — lookup by name
  - `getAgentById(db, id)` — lookup by ID
- Created `tests/agent.test.ts` with 7 passing tests
- No new npm dependencies added (uses `crypto.randomUUID()`)
