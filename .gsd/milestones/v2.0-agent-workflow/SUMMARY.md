# Milestone: v2.0-agent-workflow

## Completed: 2026-03-01

## Goal

Create comprehensive workflow guides and instruction documents that teach AI coding agents how to use `pm` CLI effectively — command reference, usage patterns, best practices, and integration examples.

## Deliverables

- ✅ Agent instruction document — full `pm` CLI reference with `--json` output schemas
- ✅ Workflow guide — step-by-step patterns (init → register → pick task → execute → comment → update status)
- ✅ Agent onboarding flow — how a new agent bootstraps itself with `pm`
- ✅ Error handling guide — common errors and how agents should recover
- ✅ Multi-agent collaboration patterns — coordination via context sharing and task assignment
- ✅ Template instructions file — canonical source that per-client adapters derive from

## Phases Completed

| Phase | Name | Plans | Completed |
|-------|------|-------|-----------|
| 1 | Agent Instruction Doc | 1 | 2026-02-28 |
| 2 | Workflow Patterns | 2 | 2026-02-28 |
| 3 | Onboarding & Error Handling | 1 | 2026-02-28 |
| 4 | Template & Verification | 2 | 2026-03-01 |

## Metrics

- Total commits: 12
- Files changed: 27
- Lines added: 3,965
- Duration: 2 days (2026-02-28 to 2026-03-01)

## Key Artifacts

| File | Description |
|------|-------------|
| `docs/agent-guide/AGENT_INSTRUCTIONS.md` | 508-line canonical template, self-contained |
| `docs/agent-guide/README.md` | Index linking all 8 guide documents |
| `docs/agent-guide/cli-reference.md` | Full CLI command reference |
| `docs/agent-guide/identity-setup.md` | Agent identity setup guide |
| `docs/agent-guide/workflows/task-lifecycle.md` | Task lifecycle workflow |
| `docs/agent-guide/workflows/context-sharing.md` | Context sharing workflow |
| `docs/agent-guide/onboarding.md` | Agent onboarding guide |
| `docs/agent-guide/error-handling.md` | Error handling & recovery guide |
| `docs/agent-guide/tests/e2e-smoke-test.sh` | 15-step E2E smoke test |

## Lessons Learned

- **Aggressive atomicity works**: 2-3 tasks per plan kept context fresh and execution clean
- **Canonical template approach**: A single self-contained template (`AGENT_INSTRUCTIONS.md`) simplifies future per-client adapter generation for v2.1
- **E2E smoke tests are high-value**: The 15-step smoke test validates the entire agent workflow end-to-end
- **CLI name `pm` may conflict**: Noted as concern — verify before npm publish
