import type Database from 'better-sqlite3';
import type { Phase } from '../db/types.js';
import { loadGsdTemplate, populatePhaseTemplate } from './template_gsd.js';
import { writePhaseContent } from './content.js';

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
function requirePhase(db: Database.Database, id: string): Phase {
    const phase = db.prepare('SELECT * FROM phases WHERE id = ?').get(id) as Phase | undefined;
    if (!phase) {
        throw new Error(`Phase '${id}' not found.`);
    }
    return phase;
}

/**
 * Add a new phase to a milestone.
 * If `projectRoot` is provided and a `.pm/templates/phase-summary.md` template exists,
 * writes a populated PHASE.md to `.pm/milestones/<milestoneId>/<number>/PHASE.md`.
 */
export function addPhase(
    db: Database.Database,
    params: { milestone_id: string; number: number; name: string; description?: string; projectRoot?: string }
): Phase {
    const { milestone_id, number, name, description, projectRoot } = params;

    requireMilestoneExists(db, milestone_id);

    const id = crypto.randomUUID();
    db.prepare(
        'INSERT INTO phases (id, milestone_id, number, name, description) VALUES (?, ?, ?, ?, ?)'
    ).run(id, milestone_id, number, name, description ?? null);

    if (projectRoot) {
        const date = new Date().toISOString().slice(0, 10);
        const raw = loadGsdTemplate(projectRoot, 'phase-summary.md');
        if (raw !== null) {
            const content = populatePhaseTemplate(raw, { phaseNumber: number, name, date });
            writePhaseContent(projectRoot, milestone_id, number, content);
        }
    }

    return db.prepare('SELECT * FROM phases WHERE id = ?').get(id) as Phase;
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
export function getPhaseById(db: Database.Database, id: string): Phase | undefined {
    return db.prepare('SELECT * FROM phases WHERE id = ?').get(id) as Phase | undefined;
}

/**
 * Update phase fields. Only non-undefined fields are updated.
 */
export function updatePhase(
    db: Database.Database,
    id: string,
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
