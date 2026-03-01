import type Database from 'better-sqlite3';
import type { Plan } from '../db/types.js';

/**
 * Validate that a phase exists. Throws if not found.
 */
function requirePhaseExists(db: Database.Database, phaseId: number): void {
    const phase = db.prepare('SELECT id FROM phases WHERE id = ?').get(phaseId);
    if (!phase) {
        throw new Error(`Phase #${phaseId} not found.`);
    }
}

/**
 * Validate that a plan exists. Throws if not found.
 */
function requirePlan(db: Database.Database, id: number): Plan {
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
    if (!plan) {
        throw new Error(`Plan #${id} not found.`);
    }
    return plan;
}

/**
 * Create a new plan within a phase.
 */
export function createPlan(
    db: Database.Database,
    params: { phase_id: number; number: number; name: string; wave?: number; content?: string }
): Plan {
    const { phase_id, number, name, wave, content } = params;

    requirePhaseExists(db, phase_id);

    const result = db.prepare(
        'INSERT INTO plans (phase_id, number, name, wave, content) VALUES (?, ?, ?, ?, ?)'
    ).run(phase_id, number, name, wave ?? 1, content ?? null);

    return db.prepare('SELECT * FROM plans WHERE id = ?').get(result.lastInsertRowid) as Plan;
}

/**
 * List plans for a phase, with optional status and wave filters. Ordered by wave ASC, number ASC.
 */
export function listPlans(
    db: Database.Database,
    phase_id: number,
    filters?: { status?: string; wave?: number }
): Plan[] {
    const conditions: string[] = ['phase_id = ?'];
    const values: any[] = [phase_id];

    if (filters?.status) {
        conditions.push('status = ?');
        values.push(filters.status);
    }
    if (filters?.wave !== undefined) {
        conditions.push('wave = ?');
        values.push(filters.wave);
    }

    return db.prepare(
        `SELECT * FROM plans WHERE ${conditions.join(' AND ')} ORDER BY wave ASC, number ASC`
    ).all(...values) as Plan[];
}

/**
 * Get a single plan by ID.
 */
export function getPlanById(db: Database.Database, id: number): Plan | undefined {
    return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
}

/**
 * Update plan fields. Only non-undefined fields are updated.
 */
export function updatePlan(
    db: Database.Database,
    id: number,
    updates: { name?: string; status?: string; content?: string; wave?: number }
): Plan {
    requirePlan(db, id);

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
        setClauses.push('name = ?');
        values.push(updates.name);
    }
    if (updates.status !== undefined) {
        setClauses.push('status = ?');
        values.push(updates.status);
        if (updates.status === 'completed') {
            setClauses.push('completed_at = CURRENT_TIMESTAMP');
        }
    }
    if (updates.content !== undefined) {
        setClauses.push('content = ?');
        values.push(updates.content);
    }
    if (updates.wave !== undefined) {
        setClauses.push('wave = ?');
        values.push(updates.wave);
    }

    if (setClauses.length === 0) {
        return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan;
    }

    values.push(id);
    db.prepare(`UPDATE plans SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan;
}
