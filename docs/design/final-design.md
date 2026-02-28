# PM CLI — Final Design Document

> **Project Management CLI tool** — ngôn ngữ chung giữa Humans và AI Agents.

---

## 1. Understanding Summary

| Mục | Chi tiết |
|-----|---------|
| **Sản phẩm** | CLI tool (`pm`) — quản lý dự án local |
| **Tech stack** | Node.js / TypeScript, SQLite |
| **Người dùng** | Humans + AI Agents (cả hai dùng chung CLI) |
| **Vấn đề giải quyết** | Workflow bị fragmented, thiếu single source of truth cho collaboration giữa người và AI |
| **Mô hình** | CLI là interface duy nhất. Không server, không API riêng |
| **Deploy** | Local (optional: Docker) |
| **Scale** | Bắt đầu solo dev, thiết kế mở rộng được |

### Non-goals
- ❌ Không thay thế Git
- ❌ Không chạy/execute code (không phải CI/CD)
- ❌ Không Web UI
- ❌ Không quản lý secrets/API keys
- ❌ Không server/REST API

### Design Principles
1. **CLI = công cụ (data tool). Workflow = logic thực thi.**
2. **Validate data integrity, không validate business logic** (status transitions, permissions, etc.)
3. **Output**: human-readable mặc định, `--json` cho agents parse
4. **YAGNI ruthlessly** — chỉ build cái cần cho MVP

---

## 2. CLI Command Structure

```bash
# ── Project ──
pm init [name]                          # Khởi tạo project (tạo .pm/ + SQLite DB)
pm status                               # Tổng quan project: tasks, agents, progress

# ── Tasks ──
pm task add "title"                     # Tạo task mới
pm task list                            # Liệt kê tasks (filter by status, agent)
pm task show <id>                       # Xem chi tiết task
pm task update <id> --status <status>   # Cập nhật status
pm task assign <id> --agent <name>      # Gán task cho agent
pm task comment <id> "note..."          # Thêm comment/context

# ── Agents ──
pm agent register <name> --role <role> --type <human|ai>
pm agent list                           # Liệt kê agents
pm agent show <name>                    # Xem profile + tasks
pm agent whoami                         # Agent tự xác định identity

# ── Context (Shared Knowledge) ──
pm context set <key> <value>            # Lưu context
pm context get <key>                    # Đọc context
pm context list                         # Liệt kê context entries
pm context search <query>              # Tìm kiếm

# ── Scaffold ──
pm scaffold <template>                  # Tạo structure từ template
```

### Agent Identity
- Flag: `--agent <name>` trên mỗi command
- Env var: `PM_AGENT=<name>` (tiện cho AI agent sessions)
- **Bắt buộc** — CLI error nếu thiếu identity

### Output Format
- Mặc định: human-readable (tables, colors)
- `--json`: structured output cho agents parse

---

## 3. Data Model (SQLite)

### agents
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| name | TEXT UNIQUE | "antigravity", "claude", "khanh" |
| role | TEXT | "developer", "reviewer", "pm", "researcher" |
| type | TEXT | "human" \| "ai" |
| created_at | DATETIME | auto |

### tasks
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | autoincrement |
| title | TEXT | required |
| description | TEXT | optional |
| status | TEXT | default: "todo" |
| priority | TEXT | "low" \| "medium" \| "high" \| "urgent" |
| assigned_to | TEXT FK→agents | nullable |
| created_by | TEXT FK→agents | who created |
| parent_id | INTEGER FK→tasks | subtasks support |
| created_at | DATETIME | auto |
| updated_at | DATETIME | auto |

### task_comments
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | autoincrement |
| task_id | INTEGER FK→tasks | required |
| agent_id | TEXT FK→agents | who commented |
| content | TEXT | required |
| created_at | DATETIME | auto |

### context
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | autoincrement |
| key | TEXT UNIQUE | "tech_stack", "architecture_decision_1" |
| value | TEXT | content (có thể dài) |
| category | TEXT | "decision" \| "spec" \| "note" \| "constraint" |
| created_by | TEXT FK→agents | who created |
| created_at | DATETIME | auto |
| updated_at | DATETIME | auto |

### SQLite Config
- **WAL mode** enabled mặc định khi `pm init`

---

## 4. Project Scaffolding

```
project/
├── .pm/
│   ├── data.db          # SQLite database
│   └── config.yaml      # Project config
└── ... (project files)
```

### config.yaml

```yaml
project:
  name: my-project
  created_at: 2026-02-28T09:30:00+07:00
  version: 1

settings:
  task_statuses:
    - todo
    - in_progress
    - review
    - done
    - blocked
    - cancelled
  agent_roles:
    - developer
    - reviewer
    - pm
    - researcher
```

> Config chỉ là gợi ý — CLI không enforce, workflow tự quyết.

---

## 5. Validation Rules

| Validate | Không validate |
|----------|---------------|
| Task tồn tại khi comment/update | Status transitions hợp lệ |
| Agent tồn tại khi assign | Permissions / quyền |
| Required fields (title, agent name) | Business logic |
| Data types đúng | Workflow rules |

---

## 6. Decision Log

| # | Quyết định | Alternatives | Lý do |
|---|-----------|-------------|-------|
| 1 | **CLI-only, không server** | Server + REST API; Embedded server | Solo dev không cần server overhead. CLI là interface tự nhiên cho cả agents. Đơn giản hơn nhiều. |
| 2 | **SQLite** | File-based (YAML/MD); PostgreSQL | Structured queries, single file, agents buộc dùng CLI → consistent access. File-based thì agents có thể đọc trực tiếp → inconsistent. |
| 3 | **Node.js/TypeScript** | Go; Rust; Python | Ecosystem phong phú cho CLI, dễ tích hợp AI tools, fast prototyping, shared knowledge trong team. |
| 4 | **Validate data integrity only** | Zero validation; Full business logic validation | Công cụ nên đơn giản — chỉ đảm bảo data không hỏng. Logic thực thi do workflow quyết định. |
| 5 | **Agent identity bắt buộc** | Optional identity | Mọi thao tác cần biết ai thực hiện. Core requirement cho collaboration. |
| 6 | **Config chỉ là gợi ý** | Config enforced by CLI | Giữ CLI đơn giản. Workflow files quyết định logic. Tool ≠ Process. |
| 7 | **Subtask status = manual** | Auto-calculate from children | YAGNI. Auto-calculate thêm complexity không cần cho MVP. |
| 8 | **Local Docker cho deploy** | VPS; Cloud | Solo dev, local-first. Docker optional cho reproducibility. |

---

## 7. Assumptions

1. CLI install global via npm: `npm i -g @pm/cli` (hoặc tên tương tự)
2. Mỗi project có `.pm/` directory riêng (project-scoped)
3. Không cần real-time sync — CLI đọc/ghi tuần tự là đủ
4. Tên tool: `pm` (có thể đổi nếu conflict với tool khác)
5. Agent identity = name + role + type, lưu trong DB
6. `.pm/` folder — user tự quyết có thêm vào `.gitignore` hay không

---

## 8. MVP Features Summary

| Feature | Included | Deferred |
|---------|----------|----------|
| Task CRUD | ✅ MVP | |
| Agent registration | ✅ MVP | |
| Project scaffolding | ✅ MVP | |
| Context sharing | ✅ MVP | |
| CLI as protocol | ✅ MVP | |
| Status dashboard | | v2 |
| Activity/audit log | | v2 |
| Auth & permissions | | v2 |
| Task dependencies | | v2 |
| Auto subtask status | | v2 |
| MCP protocol | | v2 |
