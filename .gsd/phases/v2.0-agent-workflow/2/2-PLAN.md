---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Multi-Agent Collaboration Patterns

## Objective

Create a guide documenting patterns for multiple AI agents to coordinate work using `pm` — task assignment, handoffs, and shared context.

## Context

- `docs/agent-guide/workflows/task-lifecycle.md` — Task lifecycle (from Plan 2.1)
- `docs/agent-guide/workflows/context-sharing.md` — Context sharing (from Plan 2.1)
- `src/core/task.ts` — Task assignment logic
- `src/core/context.ts` — Context sharing logic

## Tasks

<task type="auto">
  <name>Create Multi-Agent Collaboration Guide</name>
  <files>docs/agent-guide/workflows/collaboration.md</files>
  <action>
    Create `docs/agent-guide/workflows/collaboration.md` with:

    1. **Overview** — How multiple agents coordinate using tasks and context as communication channels.

    2. **Pattern 1: Task Handoff**
       - Agent A creates subtasks and assigns to Agent B
       - Agent B picks up, works, marks done
       - Agent A checks status and continues
       Show exact commands for both agents.

    3. **Pattern 2: Shared Decisions**
       - Before making a decision, check context:
         ```bash
         pm context search "db-engine" --json
         ```
       - If no decision exists, set one:
         ```bash
         pm context set "db-engine" "PostgreSQL" --category decision --agent <name>
         ```
       - Other agents check before conflicting.

    4. **Pattern 3: Status Broadcasting**
       - Use comments to broadcast status to all watchers of a task
       - Use context to broadcast project-wide state

    5. **Pattern 4: Subtask Decomposition**
       - Parent task as orchestrator
       - Create subtasks with `--parent <id>`
       - Monitor subtask completion via `pm task list --parent <id> --json`

    6. **Anti-Patterns** — What NOT to do:
       - Don't rely on file-system locks for coordination
       - Don't poll aggressively — check status at logical checkpoints
       - Don't overwrite context without checking existing values first
  </action>
  <verify>test -f docs/agent-guide/workflows/collaboration.md && grep -c "Pattern" docs/agent-guide/workflows/collaboration.md | awk '{if ($1 >= 4) print "OK"; else print "FAIL"}'</verify>
  <done>File exists with 4+ collaboration patterns and anti-patterns section</done>
</task>

## Success Criteria

- [ ] Collaboration guide with 4+ patterns documented
- [ ] Each pattern has exact commands for both/all agents involved
- [ ] Anti-patterns section warns against common mistakes
