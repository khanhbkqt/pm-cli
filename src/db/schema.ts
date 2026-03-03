/**
 * SQLite schema definition — 7 tables for project management + workflow engine.
 */

export const SCHEMA_VERSION = 3;

export const SCHEMA_SQL = `
-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('human', 'ai')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- Context table
CREATE TABLE IF NOT EXISTS context (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT DEFAULT 'note' CHECK(category IN ('decision', 'spec', 'note', 'constraint')),
  created_by TEXT NOT NULL REFERENCES agents(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Milestones table (workflow engine)
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'active', 'completed', 'archived')),
  created_by TEXT NOT NULL REFERENCES agents(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Phases table (workflow engine)
CREATE TABLE IF NOT EXISTS phases (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL REFERENCES milestones(id),
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started', 'planning', 'in_progress', 'completed', 'skipped')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  UNIQUE(milestone_id, number)
);

-- Plans table (workflow engine)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES phases(id),
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  wave INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  UNIQUE(phase_id, number)
);

-- Bugs table (bug tracking)
CREATE TABLE IF NOT EXISTS bugs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'fixing', 'resolved', 'closed', 'wontfix', 'duplicate')),
  reported_by TEXT NOT NULL REFERENCES agents(id),
  assigned_to TEXT REFERENCES agents(id),
  milestone_id TEXT REFERENCES milestones(id),
  phase_id TEXT REFERENCES phases(id),
  blocking INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

-- Workflow state table (session persistence)
CREATE TABLE IF NOT EXISTS workflow_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_by TEXT NOT NULL REFERENCES agents(id),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
