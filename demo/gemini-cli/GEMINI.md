# Gemini CLI Context

<!-- pm-cli:start -->
## PM CLI Integration

This project uses `pm` CLI for project management. Follow these instructions when working on tasks.

<!-- version: 2.0.0 -->

# PM CLI Agent Instructions

You are an AI coding agent working in a project managed by `pm` — a CLI tool for multi-agent project management with workflow-driven state transitions.

**Core principle:** Always use `--json` for machine-readable output. Always set agent identity before running commands.

## Quick Start

1. **Initialize project:** `pm init`
2. **Register identity:** `pm agent register <your-name> --role developer --type ai --json`
3. **Set session identity:** `export PM_AGENT=<your-name>`
4. **Verify identity:** `pm agent whoami --json`
5. **Check progress:** `pm progress`

## Workflow Lifecycle

PM uses a milestone → phase → plan hierarchy with workflow state transitions:

```
Milestone (planned → active → completed → archived)
  └─ Phase (not_started → planning → in_progress → completed)
       └─ Plan (pending → in_progress → completed)
```

- **Milestones** define high-level goals (e.g., "v1.0 MVP")
- **Phases** group work into ordered steps (e.g., "Foundation", "Core API")
- **Plans** are individual work items with wave-based parallel execution

**Key commands:**
- `pm milestone create/list/show/update`
- `pm phase add/list/show/update`
- `pm plan create/list/show/update/board`
- `pm progress` — dashboard view of milestone progress

## PM Skills (READ BEFORE ACTING)

To save your context window, detailed instructions are in smaller skill files.

**CRITICAL RULE:** Before attempting complex PM operations, read the relevant skill file from the `skills/` directory.

- **[Identity & Registration]** → `pm-identity.md` — role types, identity persistence
- **[Context & Decisions]** → `pm-context.md` — sharing decisions, 4 strict categories
- **[Collaboration]** → `pm-collaboration.md` — plan handoffs, shared workflows
- **[Error Recovery]** → `pm-errors.md` — common errors and recovery

## PM Workflows

Workflow instructions are in the `workflows/` directory. Key workflows:
- `pm-new-project.md` — initialize a project
- `pm-new-milestone.md` — create a milestone
- `pm-plan-phase.md` — create plans for a phase
- `pm-execute-phase.md` — wave-based execution
- `pm-verify-work.md` — validate deliverables
- `pm-progress.md` — check milestone progress

> *Path note:* In the pm-cli repo: `docs/agent-guide/skills/` and `docs/agent-guide/workflows/`. In target projects: `.agent/skills/` or `.cursor/rules/` depending on the client.


## Available Workflows

| Workflow | Description |
|----------|-------------|
| add-phase | Add a new phase to the active milestone |
| add-todo | Quickly capture a todo item for later |
| audit-milestone | Audit a milestone before completion |
| brainstorm | Brainstorm, clarify requirements, and bootstrap project documentation |
| check-todos | Review and prioritize pending todo items |
| complete-milestone | Complete and optionally archive a milestone |
| debug | Track and resolve bugs systematically |
| discuss-phase | Discuss and clarify phase scope before planning |
| execute-phase | Execute plans in a phase using wave-based ordering |
| help | Show all available pm workflows and commands |
| insert-phase | Insert a phase between existing phases (renumbers subsequent) |
| install | Install pm-cli agent config for AI coding clients |
| list-phase-assumptions | List assumptions made during phase planning |
| map | Analyze codebase and generate architecture documentation |
| new-milestone | Create and activate a new milestone with phases |
| new-project | Initialize a new project with pm |
| pause | Context hygiene — dump state for clean session handoff |
| plan-milestone-gaps | Create plans to address gaps found in milestone audit |
| plan-phase | Create executable plans for a phase with research and verification |
| progress | Show current position in roadmap and next steps |
| remove-phase | Remove a phase from the milestone with safety checks |
| research-phase | Deep technical research for a phase before planning |
| resume | Restore context from previous session |
| update | Update pm-cli to the latest version |
| verify-work | Validate work against requirements with empirical evidence |
| web-search | Search the web for information to inform decisions |
| whats-new | Show recent pm-cli changes and new features |
<!-- pm-cli:end -->
