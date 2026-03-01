import type Database from 'better-sqlite3';
import type { Milestone } from '../db/types.js';
import { getAgentById } from './agent.js';

/**
 * Validate that an agent exists. Throws if not found.
 */
function requireAgent(db: Database.Database, agentId: string, label: string): void {
    const agent = getAgentById(db, agentId);
    if (!agent) {
        throw new Error(`${label} agent '${agentId}' not found.`);
    }
}

/**
 * Validate that a milestone exists. Throws if not found.
 */
function requireMilestone(db: Database.Database, id: string): Milestone {
    const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id) as Milestone | undefined;
    if (!milestone) {
        throw new Error(`Milestone '${id}' not found.`);
    }
    return milestone;
}

/**
 * Create a new milestone.
 */
export function createMilestone(
    db: Database.Database,
    params: { id: string; name: string; goal?: string; created_by: string }
): Milestone {
    const { id, name, goal, created_by } = params;

    requireAgent(db, created_by, 'Creator');

    db.prepare(
        'INSERT INTO milestones (id, name, goal, created_by) VALUES (?, ?, ?, ?)'
    ).run(id, name, goal ?? null, created_by);

    return db.prepare('SELECT * FROM milestones WHERE id = ?').get(id) as Milestone;
}

/**
 * List milestones with optional status filter.
 */
export function listMilestones(
    db: Database.Database,
    filters?: { status?: string }
): Milestone[] {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters?.status) {
        conditions.push('status = ?');
        values.push(filters.status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return db.prepare(`SELECT * FROM milestones ${where} ORDER BY created_at DESC`).all(...values) as Milestone[];
}

/**
 * Get a single milestone by ID.
 */
export function getMilestoneById(db: Database.Database, id: string): Milestone | undefined {
    return db.prepare('SELECT * FROM milestones WHERE id = ?').get(id) as Milestone | undefined;
}

/**
 * Update milestone fields. Only non-undefined fields are updated.
 */
export function updateMilestone(
    db: Database.Database,
    id: string,
    updates: { name?: string; goal?: string; status?: string }
): Milestone {
    requireMilestone(db, id);

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
        setClauses.push('name = ?');
        values.push(updates.name);
    }
    if (updates.goal !== undefined) {
        setClauses.push('goal = ?');
        values.push(updates.goal);
    }
    if (updates.status !== undefined) {
        setClauses.push('status = ?');
        values.push(updates.status);
        if (updates.status === 'completed') {
            setClauses.push('completed_at = CURRENT_TIMESTAMP');
        }
    }

    if (setClauses.length === 0) {
        return db.prepare('SELECT * FROM milestones WHERE id = ?').get(id) as Milestone;
    }

    values.push(id);
    db.prepare(`UPDATE milestones SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    return db.prepare('SELECT * FROM milestones WHERE id = ?').get(id) as Milestone;
}

/**
 * Get the currently active milestone (status = 'active').
 */
export function getActiveMilestone(db: Database.Database): Milestone | undefined {
    return db.prepare("SELECT * FROM milestones WHERE status = 'active'").get() as Milestone | undefined;
}
