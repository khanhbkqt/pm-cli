# Context Sharing Workflow

How AI agents share decisions, constraints, and project knowledge through `pm context` — the shared key-value store that enables inter-agent communication.

## What is Context?

Context is a persistent key-value store scoped to the project. Any agent can read and write entries. Each entry has:

- **Key** — A unique identifier (kebab-case recommended, e.g. `api-base-url`)
- **Value** — A string value (plain text or serialized JSON)
- **Category** — One of four types that describe the entry's purpose
- **Creator** — The agent who set the entry (tracked automatically)

Context persists across sessions. Once set, it stays until overwritten.

---

## Categories

| Category | Purpose | When to Use |
|----------|---------|-------------|
| `decision` | Architectural or design choices | Choosing a database, API versioning strategy, auth method |
| `spec` | Requirements or specifications | API endpoint contracts, data schemas, acceptance criteria |
| `note` | General information | Implementation notes, findings, observations |
| `constraint` | Limitations or rules | Rate limits, budget constraints, compatibility requirements |

**Default:** If you omit `--category`, entries are created as `note`.

---

## Storing Context

### Setting a Simple Value

```bash
pm context set "api-base-url" "http://localhost:3000" --category decision --agent atlas --json
```

```json
{
  "id": 1,
  "key": "api-base-url",
  "value": "http://localhost:3000",
  "category": "decision",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-03-01T09:00:00.000Z",
  "updated_at": "2026-03-01T09:00:00.000Z"
}
```

### Storing Complex Data

For structured data, serialize as a JSON string:

```bash
pm context set "db-config" '{"engine":"sqlite","mode":"wal","path":"data.db"}' --category decision --agent atlas --json
```

```json
{
  "id": 2,
  "key": "db-config",
  "value": "{\"engine\":\"sqlite\",\"mode\":\"wal\",\"path\":\"data.db\"}",
  "category": "decision",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-03-01T09:05:00.000Z",
  "updated_at": "2026-03-01T09:05:00.000Z"
}
```

### Recording a Constraint

```bash
pm context set "max-response-time" "200ms for all API endpoints" --category constraint --agent atlas --json
```

```json
{
  "id": 3,
  "key": "max-response-time",
  "value": "200ms for all API endpoints",
  "category": "constraint",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-03-01T09:10:00.000Z",
  "updated_at": "2026-03-01T09:10:00.000Z"
}
```

### Storing a Spec

```bash
pm context set "auth-spec" "JWT tokens, 24h expiry, RS256 signing, refresh tokens not supported" --category spec --agent atlas --json
```

```json
{
  "id": 4,
  "key": "auth-spec",
  "value": "JWT tokens, 24h expiry, RS256 signing, refresh tokens not supported",
  "category": "spec",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-03-01T09:15:00.000Z",
  "updated_at": "2026-03-01T09:15:00.000Z"
}
```

---

## Reading Context

### Get a Specific Entry

```bash
pm context get "api-base-url" --json
```

```json
{
  "id": 1,
  "key": "api-base-url",
  "value": "http://localhost:3000",
  "category": "decision",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-03-01T09:00:00.000Z",
  "updated_at": "2026-03-01T09:00:00.000Z"
}
```

### List All Context

```bash
pm context list --json
```

```json
[
  {
    "id": 1,
    "key": "api-base-url",
    "value": "http://localhost:3000",
    "category": "decision",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:00:00.000Z",
    "updated_at": "2026-03-01T09:00:00.000Z"
  },
  {
    "id": 3,
    "key": "max-response-time",
    "value": "200ms for all API endpoints",
    "category": "constraint",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:10:00.000Z",
    "updated_at": "2026-03-01T09:10:00.000Z"
  }
]
```

### Filter by Category

List only decisions:

```bash
pm context list --category decision --json
```

```json
[
  {
    "id": 1,
    "key": "api-base-url",
    "value": "http://localhost:3000",
    "category": "decision",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:00:00.000Z",
    "updated_at": "2026-03-01T09:00:00.000Z"
  },
  {
    "id": 2,
    "key": "db-config",
    "value": "{\"engine\":\"sqlite\",\"mode\":\"wal\",\"path\":\"data.db\"}",
    "category": "decision",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:05:00.000Z",
    "updated_at": "2026-03-01T09:05:00.000Z"
  }
]
```

List only constraints:

```bash
pm context list --category constraint --json
```

```json
[
  {
    "id": 3,
    "key": "max-response-time",
    "value": "200ms for all API endpoints",
    "category": "constraint",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:10:00.000Z",
    "updated_at": "2026-03-01T09:10:00.000Z"
  }
]
```

---

## Searching Context

Search by key or value substring:

```bash
pm context search "api" --json
```

```json
[
  {
    "id": 1,
    "key": "api-base-url",
    "value": "http://localhost:3000",
    "category": "decision",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:00:00.000Z",
    "updated_at": "2026-03-01T09:00:00.000Z"
  },
  {
    "id": 3,
    "key": "max-response-time",
    "value": "200ms for all API endpoints",
    "category": "constraint",
    "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-03-01T09:10:00.000Z",
    "updated_at": "2026-03-01T09:10:00.000Z"
  }
]
```

Search matches against both `key` and `value` fields.

---

## Updating Context

Overwrite an existing entry by setting the same key:

```bash
pm context set "api-base-url" "https://api.example.com" --category decision --agent atlas --json
```

```json
{
  "id": 1,
  "key": "api-base-url",
  "value": "https://api.example.com",
  "category": "decision",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-03-01T09:00:00.000Z",
  "updated_at": "2026-03-01T11:00:00.000Z"
}
```

> **Caution:** Setting a key that already exists overwrites it. Always check existing context before making decisions that might conflict with another agent's choices.

---

## Multi-Agent Coordination via Context

Context enables agents to share project-wide state without direct communication.

### Scenario: Deployment Pipeline

Agent A prepares staging:

```bash
pm context set "deploy-status" "staging" --category note --agent agent-a --json
```

Agent B checks before deploying to production:

```bash
pm context get "deploy-status" --json
# Returns: "staging" → safe to proceed with production after staging passes

pm context set "deploy-status" "production" --category note --agent agent-b --json
```

### Scenario: Avoiding Conflicting Decisions

Agent B wants to choose a database engine:

```bash
# First, check if a decision already exists
pm context search "db" --json
```

If a `db-config` entry exists, respect it. If not, set your own:

```bash
pm context set "db-engine" "PostgreSQL" --category decision --agent agent-b --json
```

---

## Key Naming Conventions

| Pattern | Examples | Use For |
|---------|----------|---------|
| `{noun}` | `db-engine`, `auth-method` | Simple values |
| `{noun}-{detail}` | `api-base-url`, `deploy-status` | Specific settings |
| `{scope}-{noun}` | `frontend-framework`, `backend-language` | Scoped decisions |

**Rules:**
- Use **kebab-case** (lowercase, hyphens between words)
- Be descriptive — other agents need to find your entries
- Avoid abbreviations unless universally understood

---

## Best Practices

1. **Check before setting** — Always `pm context search` or `pm context list --category decision` before making a decision that could conflict
2. **Use the right category** — `decision` for choices, `constraint` for limits, `spec` for requirements, `note` for everything else
3. **Be descriptive in values** — "PostgreSQL 15 with pgvector extension" is better than "postgres"
4. **Use kebab-case keys** — Consistent naming makes searching reliable
5. **Store JSON for complex data** — Serialize structured values as JSON strings
6. **Document reasoning** — If overwriting a value, use a task comment to explain why you changed it
