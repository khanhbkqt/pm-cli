---
phase: 7
level: 2
researched_at: 2026-03-01
---

# Phase 7 Research — Agent Workflow Templates

## Questions Investigated

1. What workflows does GSD ship and which map to pm-cli commands?
2. What format should workflow instruction files use (client-agnostic)?
3. Where do workflow files live in the project source?
4. Which workflows are essential vs. nice-to-have?
5. How should workflow files be structured to teach agents effectively?

## Findings

### Q1: GSD Workflow Catalog → pm-cli Mapping

From the GSD GitHub repo (github.com/gsd-build/get-shit-done), 25 workflows exist. Relevant mappings to pm-cli commands:

| GSD Workflow | pm-cli Workflow File | Core pm Commands Used |
|---|---|---|
| **Core Lifecycle** | | |
| `/gsd:new-project` | `pm-new-project.md` | `pm init`, `pm milestone create`, `pm milestone update --status active` |
| `/gsd:new-milestone` | `pm-new-milestone.md` | `pm milestone create`, `pm milestone update --status active` |
| `/gsd:discuss-phase` | `pm-discuss-phase.md` | `pm phase show`, `pm context set` |
| `/gsd:plan-phase` | `pm-plan-phase.md` | `pm plan create`, `pm phase update --status planning` |
| `/gsd:execute-phase` | `pm-execute-phase.md` | `pm plan update --status in_progress/completed/failed`, `pm progress` |
| `/gsd:verify-work` | `pm-verify-work.md` | `pm plan update --status completed/failed`, `pm phase update --status completed` |
| `/gsd:audit-milestone` | `pm-audit-milestone.md` | `pm progress`, `pm milestone show` |
| `/gsd:complete-milestone` | `pm-complete-milestone.md` | `pm milestone update --status completed`, `pm milestone update --status archived` |
| **Navigation** | | |
| `/gsd:progress` | `pm-progress.md` | `pm progress`, `pm milestone show`, `pm phase list` |
| **Phase Management** | | |
| `/gsd:add-phase` | `pm-add-phase.md` | `pm phase add` |
| **Session** | | |
| `/gsd:pause-work` | `pm-pause.md` | `pm context set`, `pm status` |
| `/gsd:resume-work` | `pm-resume.md` | `pm status`, `pm progress`, `pm phase list` |
| **Utilities** | | |
| `/gsd:debug` | `pm-debug.md` | `pm task add`, `pm context set` |
| `/gsd:add-todo` | `pm-add-todo.md` | `pm task add --priority low` |
| `/gsd:check-todos` | `pm-check-todos.md` | `pm task list --status todo` |

**Not needed** (GSD-specific infrastructure): `install`, `update`, `help`, `whats-new`, `set-profile`, `map`, `settings`, `health`, `quick`, `plan-milestone-gaps`, `list-phase-assumptions`, `insert-phase`, `remove-phase`, `join-discord`

### Q2: File Format — Client-Agnostic Markdown

GSD uses Claude Code slash commands (YAML frontmatter + XML sections, with `allowed-tools` for Claude-specific tools). 

pm-cli must be **client-agnostic** — supporting Antigravity, Cursor, Claude Code, Codex, OpenCode, Gemini CLI. The format should be:

**Plain Markdown with YAML frontmatter only** (no XML, no Claude-specific directives):

```markdown
---
description: <one-line description for client sidebar display>
---

# /pm-plan-phase Workflow

## Objective
<what this workflow accomplishes>

## When to Use
<trigger conditions>

## Steps
<numbered step-by-step instructions with exact pm CLI commands>

## Success Criteria
<how to know it worked>
```

- Frontmatter `description` field used by Antigravity, Cursor, and Gemini CLI for sidebar display
- No `allowed-tools` (not portable) — agents use whatever tools they have
- Pure markdown body = readable by any LLM in any client
- Include exact `pm` CLI command examples in code blocks

### Q3: Source File Location

Workflow templates live in `docs/agent-guide/workflows/` (existing directory already has `task-lifecycle.md`, `collaboration.md`, `context-sharing.md`).

New pm-lifecycle workflow files added alongside existing ones:
```
docs/agent-guide/workflows/
├── task-lifecycle.md          ← existing
├── collaboration.md           ← existing
├── context-sharing.md         ← existing
├── pm-new-project.md          ← NEW
├── pm-new-milestone.md        ← NEW
├── pm-discuss-phase.md        ← NEW
├── pm-plan-phase.md           ← NEW
├── pm-execute-phase.md        ← NEW
├── pm-verify-work.md          ← NEW
├── pm-audit-milestone.md      ← NEW
├── pm-complete-milestone.md   ← NEW
├── pm-progress.md             ← NEW
├── pm-add-phase.md            ← NEW
├── pm-pause.md                ← NEW
├── pm-resume.md               ← NEW
├── pm-debug.md                ← NEW
├── pm-add-todo.md             ← NEW
└── pm-check-todos.md          ← NEW
```

### Q4: Essential vs. Nice-to-Have

**Must-have (core lifecycle, uses new Phase 4-5 commands):**
- `pm-plan-phase.md` — creates plans via `pm plan create`
- `pm-execute-phase.md` — transitions plans through states
- `pm-verify-work.md` — marks plans complete/failed
- `pm-progress.md` — checks milestone progress
- `pm-complete-milestone.md` — completes and archives milestone
- `pm-new-milestone.md` — starts a new milestone

**Should-have (common workflow support):**
- `pm-discuss-phase.md` — pre-planning discussion
- `pm-audit-milestone.md` — pre-completion audit
- `pm-pause.md` / `pm-resume.md` — session management
- `pm-add-phase.md` — phase management

**Nice-to-have (utilities):**
- `pm-debug.md`, `pm-add-todo.md`, `pm-check-todos.md`, `pm-new-project.md`

### Q5: Workflow File Structure

Each file follows this structure (adapted from GSD's design, simplified for portability):

1. **YAML frontmatter** — `description` only
2. **Objective** — one paragraph, what it does and when to use it
3. **Prerequisites** — what must exist before running
4. **Steps** — numbered, with exact `pm` CLI commands in code blocks
5. **Cascading behavior** — what happens automatically (phases auto-complete, etc.)
6. **Success criteria** — how to verify it worked
7. **Next steps** — what workflow to run next

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Format | Plain markdown + YAML frontmatter `description` | Client-agnostic, works in all 6 supported clients |
| No XML/allowed-tools | Skip Claude-specific directives | Portability requirement |
| Source location | `docs/agent-guide/workflows/` | Existing directory, consistent with current structure |
| File naming | `pm-<workflow>.md` prefix | Distinguishes pm-cli workflows from existing task-lifecycle etc. |
| Scope | 15 workflow files (6 must-have, 4 should-have, 5 nice-to-have) | Full GSD lifecycle coverage without GSD-specific infrastructure |

## Patterns to Follow

- Exact `pm` command examples in every step (agents copy-paste)
- Status values spelled out (not just "update status") — `pending → in_progress → completed`
- Show cascade effects explicitly (e.g., "Starting a plan auto-starts its phase")
- Include `--json` examples for programmatic use
- Reference `pm progress` for state verification

## Anti-Patterns to Avoid

- Don't use Claude-specific XML tags (`<objective>`, `<process>`, etc.)
- Don't reference GSD file paths (`.planning/`, PLAN.md, SUMMARY.md) — pm-cli uses DB
- Don't reference `allowed-tools` — not portable
- Don't embed agent-type-specific instructions

## Dependencies Identified

No new code dependencies. Phase 7 is **documentation only**:
- Markdown files in `docs/agent-guide/workflows/`
- Phase 8 handles the install system update to deploy them

## Risks

- **Volume**: 15 files is substantial — mitigated by consistent template structure
- **Accuracy**: Workflow steps must match actual CLI behavior — mitigated by writing after Phase 5 (progress command) is complete
- **Maintenance**: New commands require workflow updates — low risk for v3.0 scope

## Ready for Planning

- [x] Questions answered
- [x] GSD catalog analyzed (25 workflows cataloged, 15 relevant to pm-cli)
- [x] Format decided (plain markdown, client-agnostic)
- [x] File locations identified
- [x] Priority tiers defined
