---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Task Lifecycle Workflow

## Objective

Create a step-by-step workflow guide showing how an AI agent manages tasks from creation through completion — the core loop that agents will follow most often.

## Context

- `docs/agent-guide/cli-reference.md` — Command reference (from Phase 1)
- `docs/agent-guide/identity-setup.md` — Identity setup (from Phase 1)
- `src/core/task.ts` — Task CRUD logic
- `src/cli/commands/task.ts` — Task CLI commands

## Tasks

<task type="auto">
  <name>Create Task Lifecycle Workflow Guide</name>
  <files>docs/agent-guide/workflows/task-lifecycle.md</files>
  <action>
    Create `docs/agent-guide/workflows/task-lifecycle.md` with:

    1. **Overview** — The task lifecycle: todo → in-progress → done (with review, blocked states)

    2. **Step 1: Find Available Tasks**
       ```bash
       pm task list --status todo --json
       ```
       Show how to parse JSON output to find unassigned tasks.

    3. **Step 2: Claim a Task**
       ```bash
       pm task assign <id> --to <my-name> --agent <my-name> --json
       ```

    4. **Step 3: Start Work**
       ```bash
       pm task update <id> --status in-progress --agent <my-name> --json
       ```
       Add a comment about what you're doing:
       ```bash
       pm task comment <id> "Starting implementation of..." --agent <my-name>
       ```

    5. **Step 4: Report Progress**
       Use comments to log progress:
       ```bash
       pm task comment <id> "Completed X, moving to Y" --agent <my-name>
       ```

    6. **Step 5: Complete Task**
       ```bash
       pm task update <id> --status done --agent <my-name> --json
       pm task comment <id> "Task completed. Changes: ..." --agent <my-name>
       ```

    7. **Complete Flow Example** — Full script showing an agent picking up task #3 and completing it.

    Every command must use `--agent` flag. Show both the command and expected JSON output.
    Do NOT assume the agent has PM_AGENT set — always show `--agent` flag explicitly in workflow examples.
  </action>
  <verify>test -f docs/agent-guide/workflows/task-lifecycle.md && grep -c "pm task" docs/agent-guide/workflows/task-lifecycle.md | awk '{if ($1 >= 10) print "OK"; else print "FAIL"}'</verify>
  <done>File exists with 5+ workflow steps, each with exact commands and JSON outputs</done>
</task>

<task type="auto">
  <name>Create Context Sharing Workflow</name>
  <files>docs/agent-guide/workflows/context-sharing.md</files>
  <action>
    Create `docs/agent-guide/workflows/context-sharing.md` with:

    1. **What is Context?** — Shared key-value store for decisions, specs, notes, constraints. Used for inter-agent communication.

    2. **Categories** — decision, spec, note, constraint. When to use each.

    3. **Storing Context**
       ```bash
       pm context set "api-base-url" "http://localhost:3000" --category decision --agent <name> --json
       ```

    4. **Reading Context**
       ```bash
       pm context get "api-base-url" --json
       pm context list --category decision --json
       ```

    5. **Searching Context**
       ```bash
       pm context search "api" --json
       ```

    6. **Patterns**:
       - Store architectural decisions as `category=decision`
       - Store project constraints as `category=constraint`
       - Use descriptive keys (kebab-case recommended)
       - Store JSON values as strings for complex data
       - Check existing context before making conflicting decisions

    7. **Multi-Agent Coordination** — How agents use context to share state:
       - Agent A sets `deploy-status=staging`
       - Agent B reads it before deploying to production
  </action>
  <verify>test -f docs/agent-guide/workflows/context-sharing.md && grep -c "pm context" docs/agent-guide/workflows/context-sharing.md | awk '{if ($1 >= 8) print "OK"; else print "FAIL"}'</verify>
  <done>File exists with context CRUD patterns and multi-agent coordination example</done>
</task>

## Success Criteria

- [ ] Task lifecycle workflow with 5+ steps and runnable commands
- [ ] Context sharing workflow with all 4 categories explained
- [ ] Both files have concrete JSON output examples
