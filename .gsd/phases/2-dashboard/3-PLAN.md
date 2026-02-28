---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: API Integration Tests

## Objective
Write comprehensive integration tests for all API endpoints using Vitest. Tests exercise the full stack: HTTP request → Express route → core function → SQLite (in-memory). This ensures the API layer correctly delegates to core logic and returns proper HTTP responses.

## Context
- tests/server.test.ts (existing pattern)
- src/server/app.ts
- src/server/routes/tasks.ts
- src/server/routes/agents.ts
- src/server/routes/context.ts
- src/server/routes/status.ts
- src/db/schema.ts

## Tasks

<task type="auto">
  <name>Write API integration tests</name>
  <files>tests/api.test.ts</files>
  <action>
    Create `tests/api.test.ts` following the pattern in `tests/server.test.ts`:

    **Test setup:**
    - Create in-memory SQLite DB, run `SCHEMA_SQL` to create tables
    - Create Express app via `createApp(db)`
    - Start server on available port via `getAvailablePort`
    - `afterEach` / `afterAll`: close server, close db
    - Register a test agent before each test group (agent is needed for task creation)

    **Test groups:**

    1. **Task Endpoints** (describe block):
       - POST /api/tasks — creates task, returns 201
       - GET /api/tasks — returns array with created task
       - GET /api/tasks?status=todo — filters by status
       - GET /api/tasks/:id — returns task by id
       - GET /api/tasks/999 — returns 404
       - PUT /api/tasks/:id — updates title
       - POST /api/tasks/:id/assign — assigns agent
       - POST /api/tasks/:id/comments — creates comment, returns 201
       - GET /api/tasks/:id/comments — returns comments array

    2. **Agent Endpoints** (describe block):
       - GET /api/agents — returns registered agents
       - GET /api/agents/:id — returns agent by id
       - GET /api/agents/nonexistent — returns 404

    3. **Context Endpoints** (describe block):
       - GET /api/context — returns empty initially
       - GET /api/context?category=note — filters work
       - GET /api/context/search?q=test — search works
       - GET /api/context/search — missing q returns 400

    4. **Status Endpoint** (describe block):
       - GET /api/status — returns shape with tasks.total, agents.total, context.total, recent_tasks

    Use `fetch()` for HTTP requests (available globally in Node 18+).
    Assert on both HTTP status codes AND response body shape.

    - Do NOT mock anything — use real DB, real Express, real HTTP
    - Do register a test agent using `registerAgent(db, ...)` directly before task tests
    - Do set context entries using `setContext(db, ...)` directly for context tests
  </action>
  <verify>npx vitest run tests/api.test.ts</verify>
  <done>All tests pass, covering task/agent/context/status endpoints with proper status codes and response bodies</done>
</task>

<task type="auto">
  <name>Run full test suite</name>
  <files>N/A</files>
  <action>
    Run the complete test suite to ensure no regressions:
    ```bash
    npx vitest run
    ```
    
    Verify that:
    1. All existing tests still pass (server, task, agent, context, identity, init, CLI tests)
    2. New `api.test.ts` tests pass
    3. No TypeScript compilation errors

    If any test fails, fix the issue before proceeding.
  </action>
  <verify>npx vitest run</verify>
  <done>Full test suite passes with zero failures</done>
</task>

## Success Criteria
- [ ] `tests/api.test.ts` exists with 15+ test cases
- [ ] All API endpoints tested: tasks, agents, context, status
- [ ] Tests use real HTTP requests to real Express server with in-memory DB
- [ ] Full test suite passes (existing + new tests)
- [ ] No TypeScript errors
