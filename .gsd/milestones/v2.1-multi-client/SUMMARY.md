# Milestone: v2.1-multi-client

## Completed: 2026-03-01

## Goal

Make the agent workflow guide installable on multiple AI coding clients, translating canonical instructions into each client's native configuration format.

## Deliverables

- ✅ Per-client adapter that generates native config from canonical template
- ✅ `pm install <client>` CLI command to install config for a specific client
- ✅ `pm install --all` to install for all detected clients
- ✅ Client detection (identify which AI clients are present in a project)
- ✅ Each generated config respects the client's rules (frontmatter, globs, file structure)
- ✅ Integration tests for all adapters

## Supported Clients

| Client | Config Format | Adapter |
|--------|--------------|---------|
| **Antigravity** | `.agent/workflows/*.md` + `.agent/rules/*.md` | `antigravity.ts` |
| **Claude Code** | `CLAUDE.md` (root) | `claude-code.ts` |
| **Cursor** | `.cursor/rules/*.mdc` | `cursor.ts` |
| **Codex** | `AGENTS.md` (root) | `codex.ts` |
| **OpenCode** | `AGENTS.md` + `opencode.json` | `opencode.ts` |
| **Gemini CLI** | `GEMINI.md` (root) | `gemini-cli.ts` |

## Phases Completed

1. Phase 1: Architecture & Detection — 2026-03-01
2. Phase 2: Antigravity & Claude Code — 2026-03-01
3. Phase 3: Cursor & Codex — 2026-03-01
4. Phase 4: OpenCode & CLI Command — 2026-03-01
5. Phase 5: Gemini CLI & Antigravity Rules — 2026-03-01
6. Phase 6: Tests & Documentation — 2026-03-01

## Metrics

- Total commits: 16
- Files changed: 48
- Lines added: ~3,967
- Duration: 1 day

## Key Decisions

- Adapter registry pattern for extensible client support
- Canonical template as single source of truth, per-client adapters transform to native format
- Client detection via filesystem markers (e.g., `.cursor/` dir, `.gemini/` dir)
- Antigravity adapter includes always-apply rule for agent identity
