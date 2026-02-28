---
phase: 7-dashboard
plan: 1
wave: 1
---

# Plan 7.1: Professional README.md

## Objective
Create a polished, professional README.md that serves as the main landing page for the project on GitHub. It should wow visitors, clearly communicate the value proposition, and guide users to get started quickly.

## Context
- .gsd/SPEC.md — Project vision and goals
- .gsd/ROADMAP.md — Feature overview
- package.json — Project metadata, scripts, dependencies
- src/cli/commands/ — Available CLI commands (init.ts, task.ts, agent.ts, context.ts, dashboard.ts, status.ts)
- scripts/install.sh — Installation script
- dashboard/ — React dashboard frontend

## Tasks

<task type="auto">
  <name>Create comprehensive README.md</name>
  <files>README.md (NEW)</files>
  <action>
    Create `README.md` in the project root with the following sections:

    1. **Header**: Project name "PM CLI" with tagline "Project Management CLI for Humans & AI Agents". Add badges for:
       - Node.js version (>=18.0.0, from package.json engines)
       - License (MIT — will be added in Plan 7.2)
       - TypeScript
       - Use shields.io badge format

    2. **Overview**: 2-3 sentences explaining the tool — a local-first CLI that serves as a shared protocol between humans and AI agents. SQLite as single source of truth. No server, no cloud.

    3. **Key Features**: Bullet list with emoji icons:
       - 🤖 Human-AI Collaboration — agents and humans share the same toolset
       - 📋 Task Management — full CRUD with status, priority, assignment
       - 🕵️ Agent System — register, identify, track who did what
       - 📝 Context Sharing — set, get, search context entries
       - 📊 Web Dashboard — local browser-based project view (Kanban, stats, activity feed)
       - 🔒 Local-first — everything stays on your machine, zero config

    4. **Quick Start**: Show exact commands:
       ```
       git clone <repo-url>
       cd cli-prj-mgmt
       npm install
       npm run build
       npm run install:local
       pm init my-project
       ```

    5. **Usage Examples**: Show the most common workflows with code blocks:
       - Initialize a project: `pm init my-project`
       - Register an agent: `pm agent register --name "claude" --role "developer"`
       - Add a task: `pm task add "Build login page" --priority high --agent claude`
       - List tasks: `pm task list --agent claude`
       - View status: `pm status --agent claude`
       - Share context: `pm context set api-url "http://localhost:3000" --agent claude`
       - Launch dashboard: `pm dashboard --agent claude`
       Show both human-readable and `--json` output examples.

    6. **Dashboard**: Brief description with mention of the Kanban board, stats view, agent list, context browser. Note: don't use placeholder images, just describe the features.

    7. **CLI Reference**: Table of all commands grouped by category:
       - Project: `init`
       - Tasks: `task add`, `task list`, `task show`, `task update`, `task assign`, `task comment`
       - Agents: `agent register`, `agent list`, `agent show`, `agent whoami`
       - Context: `context set`, `context get`, `context list`, `context search`
       - Dashboard: `dashboard`
       - Status: `status`

    8. **Tech Stack**: Brief list — Node.js, TypeScript, SQLite (better-sqlite3), Commander.js, Express, React+Vite

    9. **Contributing**: Link to CONTRIBUTING.md (will be created in Plan 7.2)

    10. **License**: Link to LICENSE file (MIT, created in Plan 7.2)

    Style guidelines:
    - Use clean, modern markdown formatting
    - Keep sections scannable with headers
    - Code examples should be copy-pasteable
    - Do NOT use Vietnamese — entire README in English
    - Do NOT add placeholder screenshots or images
  </action>
  <verify>
    - `test -f README.md` — file exists
    - `wc -l README.md` — should be 150-300 lines (comprehensive but not bloated)
    - `grep -c '```' README.md` — should have ≥6 code blocks (install + usage examples)
    - `grep -c '##' README.md` — should have ≥8 section headers
  </verify>
  <done>
    - README.md exists in project root
    - Contains all 10 sections listed above
    - All code examples use correct command syntax matching actual CLI
    - No placeholder images or broken links
  </done>
</task>

## Success Criteria
- [ ] README.md exists and is comprehensive (150-300 lines)
- [ ] All code examples are accurate and copy-pasteable
- [ ] Badges use correct shields.io format
- [ ] No Vietnamese text — all English
- [ ] Links to CONTRIBUTING.md and LICENSE reference correct paths
