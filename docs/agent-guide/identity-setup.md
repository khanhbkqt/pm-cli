# Agent Identity Setup

Identity links every `pm` action to the agent that performed it. This enables accountability tracking and multi-agent collaboration.

## Register Your Agent

```bash
pm agent register <name> --role <role> --type ai --json
```

**Example:**

```bash
pm agent register atlas --role developer --type ai --json
```

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-02-28T14:30:00.000Z"
}
```

> Always register with `--type ai` (not `human`). Use a descriptive role like `developer`, `reviewer`, or `pm`.

## Set Identity

Two methods, in priority order:

### Method 1: `--agent` Flag (Per-Command)

```bash
pm plan list --phase 1 --agent atlas --json
```

### Method 2: `PM_AGENT` Environment Variable (Session-Wide)

```bash
export PM_AGENT=atlas
pm plan list --phase 1 --json   # uses "atlas" automatically
```

**Recommended:** Set `PM_AGENT` at the start of your session to avoid repeating `--agent` on every command.

**Resolution priority:** `--agent` flag > `PM_AGENT` env var. If both are set, the flag wins.

## Verify Identity

Always confirm your identity before starting work:

```bash
pm agent whoami --json
```

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "atlas",
  "role": "developer",
  "type": "ai",
  "created_at": "2026-02-28T14:30:00.000Z"
}
```

## Error Handling

| Scenario | Error Message | Resolution |
|----------|---------------|------------|
| No identity set | `Error: Agent identity required. Use --agent <name> or set PM_AGENT environment variable.` | Set `--agent` flag or `export PM_AGENT=<name>` |
| Agent not found | `Error: Agent '<name>' not found` | Register first with `pm agent register` |
| Duplicate name | `Error: Agent '<name>' already exists` | Use a different name or use the existing agent |

## Best Practices

1. **Register as `ai`** — Use `--type ai` to distinguish from human team members
2. **Descriptive role** — Choose a role that reflects your function: `developer`, `reviewer`, `pm`, `researcher`
3. **Set `PM_AGENT` early** — Export the env var at session start to avoid repeating `--agent` on every command
4. **Verify with `whoami`** — Run `pm agent whoami --json` before starting work to confirm identity is active
5. **One agent per session** — Don't switch identities mid-session unless necessary
