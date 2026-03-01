---
description: PM Collaboration - How to hand off tasks and subtasks between agents
---

# PM Collaboration & Task Handoff

## Task Handoff

```bash
# Agent A creates and assigns to Agent B
pm task add "Review auth implementation" --priority high --json
pm task assign <id> --to agent-b --json
pm task comment <id> "Focus on: token expiry, error responses, CORS"

# Agent B picks up
pm task list --assigned agent-b --status todo --json
pm task update <id> --status in-progress --json
# ... do work, add comments ...
pm task update <id> --status done --json
```

## Shared Decisions

```bash
# Always check before deciding
pm context search "test" --json
# If empty → safe to decide
pm context set "test-framework" "vitest" --category decision --json
# If exists → respect it or create a discussion task
```

## Subtask Decomposition

```bash
# Create subtasks under a parent
pm task add "Implement registration" --parent 1 --priority high --json
pm task add "Implement login" --parent 1 --priority high --json
pm task add "Write tests" --parent 1 --priority medium --json

# Assign to different agents
pm task assign 11 --to agent-a --json
pm task assign 12 --to agent-b --json

# Monitor via parent filter
pm task list --parent 1 --json
```
