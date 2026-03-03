import type Database from 'better-sqlite3';
import type { Plan } from '../db/types.js';
import { writePlanContent, readPlanContent } from './content.js';


/**
 * Validate that a phase exists. Throws if not found.
 */
function requirePhaseExists(db: Database.Database, phaseId: string): void {
    const phase = db.prepare('SELECT id FROM phases WHERE id = ?').get(phaseId);
    if (!phase) {
        throw new Error(`Phase '${phaseId}' not found.`);
    }
}

/**
 * Validate that a plan exists. Throws if not found.
 */
function requirePlan(db: Database.Database, id: string): Plan {
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
    if (!plan) {
        throw new Error(`Plan '${id}' not found.`);
    }
    return plan;
}

/**
 * Create a new plan within a phase.
 * - `content` (brief) is stored in the DB for dashboard/CLI quick view.
 * - A comprehensive doc is always generated from `.pm/templates/PLAN.md` and written to
 *   `.pm/milestones/<milestoneId>/<phaseNumber>/<planNumber>-PLAN.md`
 */
export function createPlan(
    db: Database.Database,
    params: {
        phase_id: string;
        number: number;
        name: string;
        wave?: number;
        content?: string;
        projectRoot?: string;
    }
): Plan {
    const { phase_id, number, name, wave, content, projectRoot } = params;

    requirePhaseExists(db, phase_id);

    const id = crypto.randomUUID();
    // Store brief in DB for dashboard/CLI quick view
    db.prepare(
        'INSERT INTO plans (id, phase_id, number, name, wave, content) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, phase_id, number, name, wave ?? 1, content ?? null);

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan;

    return plan;
}

/**
 * List plans for a phase, with optional status and wave filters. Ordered by wave ASC, number ASC.
 */
export function listPlans(
    db: Database.Database,
    phase_id: string,
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
export function getPlanById(db: Database.Database, id: string): Plan | undefined {
    return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
}

/**
 * Read the filesystem content for a plan.
 * Resolves phase number and milestone ID from the DB, then reads the file.
 * Returns null if the content file does not exist.
 */
export function getPlanContent(
    db: Database.Database,
    planId: string,
    projectRoot: string,
): string | null {
    const row = db.prepare(`
        SELECT pl.number as plan_number, ph.number as phase_number, ph.milestone_id
        FROM plans pl
        JOIN phases ph ON ph.id = pl.phase_id
        WHERE pl.id = ?
    `).get(planId) as { plan_number: number; phase_number: number; milestone_id: string } | undefined;

    if (!row) return null;
    return readPlanContent(projectRoot, row.milestone_id, row.phase_number, row.plan_number);
}

/**
 * Update plan fields. Only non-undefined fields are updated.
 * If `content` and `projectRoot` are provided, writes content to filesystem.
 */
export function updatePlan(
    db: Database.Database,
    id: string,
    updates: {
        name?: string;
        status?: string;
        content?: string;
        wave?: number;
        projectRoot?: string;
    }
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
    if (updates.wave !== undefined) {
        setClauses.push('wave = ?');
        values.push(updates.wave);
    }
    if (updates.content !== undefined) {
        setClauses.push('content = ?');
        values.push(updates.content);
    }

    if (setClauses.length > 0) {
        values.push(id);
        db.prepare(`UPDATE plans SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    // Write content to filesystem if provided
    if (updates.content !== undefined && updates.projectRoot) {
        const row = db.prepare(`
            SELECT pl.number as plan_number, ph.number as phase_number, ph.milestone_id
            FROM plans pl
            JOIN phases ph ON ph.id = pl.phase_id
            WHERE pl.id = ?
        `).get(id) as { plan_number: number; phase_number: number; milestone_id: string };

        writePlanContent(updates.projectRoot, row.milestone_id, row.phase_number, row.plan_number, updates.content);
    }

    return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan;
}
