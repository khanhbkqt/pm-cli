---
description: PM Errors - How to recover from common PM CLI errors
---

# PM Error Recovery

All errors: `Error: <message>` on stderr, exit code `1`. Success: exit code `0`.

## Common Errors

| Error                                                                             | Cause                                | Recovery                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| `Agent identity required. Use --agent <name> or set PM_AGENT env var.`            | No identity set                      | `export PM_AGENT=<name>`                                     |
| `Agent '<name>' not registered. Run: pm agent register <name>`                    | Identity set but agent doesn't exist | `pm agent register <name> --role developer --type ai --json` |
| `Agent '<name>' already exists.`                                                  | Duplicate registration               | Use existing agent or different name                         |
| `Agent '<name>' not found`                                                        | Looking up nonexistent agent         | `pm agent list --json` to see valid agents                   |
| `Invalid agent type: '<type>'. Must be 'human' or 'ai'.`                          | Bad `--type` value                   | Use `--type ai`                                              |
| `Task #<id> not found.`                                                           | Invalid task ID                      | `pm task list --json` to see valid IDs                       |
| `Context key '<key>' not found.`                                                  | Looking up nonexistent key           | `pm context list --json` to see valid keys                   |
| `CHECK constraint failed: category IN ('decision', 'spec', 'note', 'constraint')` | Invalid context `--category` flag    | Use only `decision`, `spec`, `note`, or `constraint`         |
| `Not a PM project. Run: pm init`                                                  | No `.pm/` directory                  | `pm init` in project root                                    |
| `Project already initialized.`                                                    | Re-running init                      | No action needed                                             |

## Defensive Patterns

```bash
# 1. Always verify identity first
pm agent whoami --json 2>&1 || { echo "Identity not set"; exit 1; }

# 2. Use pm status as health check
pm status --json 2>&1 || { echo "Project not healthy"; exit 1; }

# 3. Check before registering
pm agent show my-agent --json 2>&1 || pm agent register my-agent --role developer --type ai --json

# 4. Wrap multi-step operations
set -e
pm task assign "$ID" --to "$ME" --json
pm task update "$ID" --status in-progress --json
pm task comment "$ID" "Starting work"
set +e
```
