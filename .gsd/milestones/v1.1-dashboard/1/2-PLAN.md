---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: SQLite Database Layer

## Objective
Create the database module with schema definition (4 tables: agents, tasks, task_comments, context), connection management with WAL mode, and schema initialization function.

## Context
- .gsd/SPEC.md — SQLite with WAL mode, 4 tables
- .gsd/DECISIONS.md — DECISION-008 (better-sqlite3 + plain SQL), DECISION-012 (all tables upfront)
- docs/design/final-design.md — Section 3: Data Model (full column definitions)

## Tasks

<task type="auto">
  <name>Create database connection and schema module</name>
  <files>src/db/connection.ts, src/db/schema.ts</files>
  <action>
    1. Create `src/db/schema.ts`:
       - Export a constant `SCHEMA_SQL` containing CREATE TABLE statements for all 4 tables:

       **agents table:**
       - id TEXT PRIMARY KEY (UUID)
       - name TEXT UNIQUE NOT NULL
       - role TEXT NOT NULL
       - type TEXT NOT NULL CHECK(type IN ('human', 'ai'))
       - created_at DATETIME DEFAULT CURRENT_TIMESTAMP

       **tasks table:**
       - id INTEGER PRIMARY KEY AUTOINCREMENT
       - title TEXT NOT NULL
       - description TEXT
       - status TEXT DEFAULT 'todo'
       - priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent'))
       - assigned_to TEXT REFERENCES agents(id)
       - created_by TEXT NOT NULL REFERENCES agents(id)
       - parent_id INTEGER REFERENCES tasks(id)
       - created_at DATETIME DEFAULT CURRENT_TIMESTAMP
       - updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

       **task_comments table:**
       - id INTEGER PRIMARY KEY AUTOINCREMENT
       - task_id INTEGER NOT NULL REFERENCES tasks(id)
       - agent_id TEXT NOT NULL REFERENCES agents(id)
       - content TEXT NOT NULL
       - created_at DATETIME DEFAULT CURRENT_TIMESTAMP

       **context table:**
       - id INTEGER PRIMARY KEY AUTOINCREMENT
       - key TEXT UNIQUE NOT NULL
       - value TEXT NOT NULL
       - category TEXT DEFAULT 'note' CHECK(category IN ('decision', 'spec', 'note', 'constraint'))
       - created_by TEXT NOT NULL REFERENCES agents(id)
       - created_at DATETIME DEFAULT CURRENT_TIMESTAMP
       - updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

    2. Create `src/db/connection.ts`:
       - Export function `createDatabase(dbPath: string): Database`
         - Opens better-sqlite3 connection at dbPath
         - Enables WAL mode: `db.pragma('journal_mode = WAL')`
         - Enables foreign keys: `db.pragma('foreign_keys = ON')`
         - Returns db instance
       - Export function `initializeSchema(db: Database): void`
         - Runs SCHEMA_SQL via `db.exec()`
       - Export function `getDatabase(dbPath: string): Database`
         - Convenience: creates + initializes in one call

    **Avoid**: Don't add query functions yet — those come in Phase 2-4.
    **Avoid**: Don't use ORM — plain SQL per DECISION-008.
  </action>
  <verify>
    npx tsx -e "
      import { getDatabase } from './src/db/connection.ts';
      import { existsSync, unlinkSync } from 'fs';
      const testDb = '/tmp/pm-test.db';
      if (existsSync(testDb)) unlinkSync(testDb);
      const db = getDatabase(testDb);
      const tables = db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name\").all();
      console.log('Tables:', tables.map(t => t.name));
      const walMode = db.pragma('journal_mode');
      console.log('WAL:', walMode);
      db.close();
      unlinkSync(testDb);
    "
    # Should output: Tables: ['agents', 'context', 'task_comments', 'tasks']
    # WAL: [{ journal_mode: 'wal' }]
  </verify>
  <done>4 tables created in SQLite, WAL mode enabled, foreign keys on, schema matches design doc</done>
</task>

<task type="auto">
  <name>Create database module index with type exports</name>
  <files>src/db/index.ts, src/db/types.ts</files>
  <action>
    1. Create `src/db/types.ts`:
       - Export TypeScript interfaces matching the schema:
         - Agent { id, name, role, type, created_at }
         - Task { id, title, description, status, priority, assigned_to, created_by, parent_id, created_at, updated_at }
         - TaskComment { id, task_id, agent_id, content, created_at }
         - ContextEntry { id, key, value, category, created_by, created_at, updated_at }

    2. Create `src/db/index.ts`:
       - Re-export everything from connection.ts
       - Re-export types from types.ts

    **Avoid**: Don't add repository/query classes — keep minimal.
  </action>
  <verify>
    npx tsx -e "import { getDatabase, type Agent, type Task } from './src/db/index.ts'; console.log('DB module exports OK');"
    # Should print: DB module exports OK
  </verify>
  <done>Clean db module public API with type exports and connection functions</done>
</task>

## Success Criteria
- [ ] `src/db/schema.ts` contains CREATE TABLE for agents, tasks, task_comments, context
- [ ] `src/db/connection.ts` creates database with WAL mode and foreign keys
- [ ] Schema creates all 4 tables matching design doc columns
- [ ] TypeScript types match schema definitions
- [ ] Module exports cleanly from `src/db/index.ts`
