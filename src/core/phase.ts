import type Database from 'better-sqlite3';
import type { Phase } from '../db/types.js';

/**
 * Validate that a milestone exists. Throws if not found.
 */
function requireMilestoneExists(db: Database.Database, milestoneId: string): void {
    const milestone = db.prepare('SELECT id FROM milestones WHERE id = ?').get(milestoneId);
    if (!milestone) {
        throw new Error(`Milestone '${milestoneId}' not found.`);
    }
}

/**
 * Validate that a phase exists. Throws if not found.
 */
function requirePhase(db: Database.Database, id: number): Phase {
    const phase = db.prepare('SELECT * FROM phases WHERE id = ?').get(id) as Phase | undefined;
    if (!phase) {
        throw new Error(`Phase #${id} not found.`);
    }
    return phase;
}

/**
 * Add a new phase to a milestone.
 */
export function addPhase(
    db: Database.Database,
    params: { milestone_id: string; number: number; name: string; description?: string }
): Phase {
    const { milestone_id, number, name, description } = params;

    requireMilestoneExists(db, milestone_id);

    const result = db.prepare(
        'INSERT INTO phases (milestone_id, number, name, description) VALUES (?, ?, ?, ?)'
    ).run(milestone_id, number, name, description ?? null);

    return db.prepare('SELECT * FROM phases WHERE id = ?').get(result.lastInsertRowid) as Phase;
}

/**
 * List phases for a milestone, with optional status filter. Ordered by number ASC.
 */
export function listPhases(
    db: Database.Database,
    milestone_id: string,
    filters?: { status?: string }
): Phase[] {
    const conditions: string[] = ['milestone_id = ?'];
    const values: any[] = [milestone_id];

    if (filters?.status) {
        conditions.push('status = ?');
        values.push(filters.status);
    }

    return db.prepare(
        `SELECT * FROM phases WHERE ${conditions.join(' AND ')} ORDER BY number ASC`
    ).all(...values) as Phase[];
}

/**
 * Get a single phase by ID.
 */
export function getPhaseById(db: Database.Database, id: number): Phase | undefined {
    return db.prepare('SELECT * FROM phases WHERE id = ?').get(id) as Phase | undefined;
}

/**
 * Update phase fields. Only non-undefined fields are updated.
 */
export function updatePhase(
    db: Database.Database,
    id: number,
    updates: { name?: string; description?: string; status?: string }
): Phase {
    requirePhase(db, id);

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
        setClauses.push('name = ?');
        values.push(updates.name);
    }
    if (updates.description !== undefined) {
        setClauses.push('description = ?');
        values.push(updates.description);
    }
    if (updates.status !== undefined) {
        setClauses.push('status = ?');
        values.push(updates.status);
        if (updates.status === 'completed') {
            setClauses.push('completed_at = CURRENT_TIMESTAMP');
        }
    }

    if (setClauses.length === 0) {
        return db.prepare('SELECT * FROM phases WHERE id = ?').get(id) as Phase;
    }

    values.push(id);
    db.prepare(`UPDATE phases SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    return db.prepare('SELECT * FROM phases WHERE id = ?').get(id) as Phase;
}

/**
 * Get a phase by milestone ID and phase number.
 */
export function getPhaseByNumber(
    db: Database.Database,
    milestone_id: string,
    number: number
): Phase | undefined {
    return db.prepare(
        'SELECT * FROM phases WHERE milestone_id = ? AND number = ?'
    ).get(milestone_id, number) as Phase | undefined;
}
