---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: CLI Reference Document

## Objective

Create a comprehensive CLI reference document that an AI agent can read to understand every `pm` command — syntax, required/optional flags, expected behavior, and complete `--json` output schemas for every command.

## Context

- `src/cli/commands/task.ts` — Task command definitions
- `src/cli/commands/agent.ts` — Agent command definitions
- `src/cli/commands/context.ts` — Context command definitions
- `src/cli/commands/status.ts` — Status command definition
- `src/cli/commands/init.ts` — Init command definition
- `src/db/types.ts` — TypeScript interfaces (JSON output schemas)
- `src/output/formatter.ts` — Output formatting logic

## Tasks

<task type="auto">
  <name>Create CLI Reference Markdown</name>
  <files>docs/agent-guide/cli-reference.md</files>
  <action>
    Create `docs/agent-guide/cli-reference.md` with:

    1. **Header** — Purpose statement: "This document describes every `pm` CLI command for AI agent consumption."

    2. **Global Options** section:
       - `--agent <name>` — Agent identity (required for most commands)
       - `--json` — Machine-readable JSON output
       - `PM_AGENT` env var — Alternative to `--agent`
       - Priority resolution: `--agent` > `PM_AGENT`

    3. **For each command** (init, agent register/list/show/whoami, task add/list/show/update/assign/comment, context set/get/list/search, status, dashboard):
       - Exact syntax with positional args and options
       - Required vs optional flags
       - Human-readable output example
       - `--json` output example with EXACT schema from `src/db/types.ts`
       - Error cases and exit codes (exit 1 on error)

    4. **Output Schemas** section — JSON schema definitions derived from TypeScript interfaces:
       - Agent: `{ id: string, name: string, role: string, type: "human"|"ai", created_at: string }`
       - Task: `{ id: number, title: string, description: string|null, status: string, priority: "low"|"medium"|"high"|"urgent", assigned_to: string|null, created_by: string, parent_id: number|null, created_at: string, updated_at: string }`
       - TaskComment: `{ id: number, task_id: number, agent_id: string, content: string, created_at: string }`
       - ContextEntry: `{ id: number, key: string, value: string, category: "decision"|"spec"|"note"|"constraint", created_by: string, created_at: string, updated_at: string }`
       - Status: `{ agents: number, tasks: { total, todo, in-progress, done }, context: number }`

    Do NOT use placeholders like "see source." All examples must have realistic, concrete values.
    Do NOT include dashboard server internals — only the `pm dashboard` command itself.
  </action>
  <verify>test -f docs/agent-guide/cli-reference.md && wc -l docs/agent-guide/cli-reference.md | awk '{if ($1 > 200) print "OK"; else print "FAIL: too short"}'</verify>
  <done>File exists with 200+ lines covering all 15+ commands with JSON output examples</done>
</task>

<task type="auto">
  <name>Create Identity Setup Guide</name>
  <files>docs/agent-guide/identity-setup.md</files>
  <action>
    Create `docs/agent-guide/identity-setup.md` with:

    1. **Why Identity Matters** — Every `pm` action is traced to an agent. Explain that this enables accountability and collaboration tracking.

    2. **Registration** — How to register:
       ```
       pm agent register <name> --role <role> --type ai --json
       ```
       Show exact JSON response.

    3. **Setting Identity** — Two methods:
       - `--agent <name>` flag on every command
       - `export PM_AGENT=<name>` for session-wide identity
       Recommend PM_AGENT for agent sessions.

    4. **Verifying Identity** — `pm agent whoami --json` to confirm.

    5. **Identity Resolution** — Priority order, error messages when missing/invalid.

    6. **Best Practices**:
       - Register as type `ai` (not `human`)
       - Use a descriptive role (e.g., "developer", "reviewer")
       - Set `PM_AGENT` at session start to avoid repeating `--agent`
       - Verify with `whoami` before starting work

    Keep it concise — this is a reference, not a tutorial.
  </action>
  <verify>test -f docs/agent-guide/identity-setup.md && grep -c "PM_AGENT" docs/agent-guide/identity-setup.md | awk '{if ($1 >= 3) print "OK"; else print "FAIL"}'</verify>
  <done>File exists with identity registration, env var setup, and verification steps</done>
</task>

## Success Criteria

- [ ] `docs/agent-guide/cli-reference.md` exists with all 15+ commands documented
- [ ] Each command has syntax, flags, human output, and JSON output examples
- [ ] Output schemas match `src/db/types.ts` exactly
- [ ] `docs/agent-guide/identity-setup.md` covers registration, env var, and verification
