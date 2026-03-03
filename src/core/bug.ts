import type Database from 'better-sqlite3';
import type { Bug } from '../db/types.js';
import { writeBugContent, readBugContent } from './content.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load the bug report template from `docs/templates/BUG.md`.
 * Returns null if the template file does not exist.
 */
function loadBugTemplate(projectRoot: string): string | null {
    const templatePath = path.join(projectRoot, 'docs', 'templates', 'BUG.md');
    if (!fs.existsSync(templatePath)) return null;
    return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Populate the bug template with values, replacing `{Placeholder}` tokens.
 */
function populateBugTemplate(
    template: string,
    vars: Record<string, string>,
): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        // Replace all occurrences of {Key}
        result = result.replaceAll(`{${key}}`, value);
    }
    return result;
}

// ---------------------------------------------------------------------------
// Core bug functions
// ---------------------------------------------------------------------------

/**
 * Report (create) a new bug.
 *
 * - Inserts a row into the `bugs` table.
 * - If `projectRoot` is provided, writes a comprehensive Markdown report to
 *   `.pm/bugs/<id>.md` using the template from `docs/templates/BUG.md`.
 */
export function reportBug(
    db: Database.Database,
    params: {
        title: string;
        description?: string;
        priority?: Bug['priority'];
        reported_by: string;
        milestone_id?: string;
        phase_id?: string;
        blocking?: boolean;
        projectRoot?: string;
    },
): Bug {
    const {
        title,
        description,
        priority = 'medium',
        reported_by,
        milestone_id,
        phase_id,
        blocking = false,
        projectRoot,
    } = params;

    const id = crypto.randomUUID();

    db.prepare(
        `INSERT INTO bugs (id, title, description, priority, reported_by, milestone_id, phase_id, blocking)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, title, description ?? null, priority, reported_by, milestone_id ?? null, phase_id ?? null, blocking ? 1 : 0);

    const bug = db.prepare('SELECT * FROM bugs WHERE id = ?').get(id) as Bug;

    // Write comprehensive template to filesystem
    if (projectRoot) {
        const template = loadBugTemplate(projectRoot);
        if (template) {
            const content = populateBugTemplate(template, {
                Title: title,
                Priority: priority,
                Status: 'open',
                ReportedBy: reported_by,
                MilestoneId: milestone_id ?? '',
                PhaseId: phase_id ?? '',
                Timestamp: bug.created_at,
            });
            writeBugContent(projectRoot, id, content);
        } else {
            // Minimal stub if no template exists
            const stub = `# ${title}\n\n**Priority**: ${priority}\n**Status**: open\n**Reported by**: ${reported_by}\n\n## Description\n\n${description ?? 'No description provided.'}\n`;
            writeBugContent(projectRoot, id, stub);
        }
    }

    return bug;
}

/**
 * List bugs with optional filters.
 * Order: priority (critical > high > medium > low), then created_at DESC.
 */
export function listBugs(
    db: Database.Database,
    filters?: {
        priority?: Bug['priority'];
        status?: Bug['status'];
        blocking?: boolean;
        milestone_id?: string;
    },
): Bug[] {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters?.priority) {
        conditions.push('priority = ?');
        values.push(filters.priority);
    }
    if (filters?.status) {
        conditions.push('status = ?');
        values.push(filters.status);
    }
    if (filters?.blocking !== undefined) {
        conditions.push('blocking = ?');
        values.push(filters.blocking ? 1 : 0);
    }
    if (filters?.milestone_id) {
        conditions.push('milestone_id = ?');
        values.push(filters.milestone_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return db.prepare(
        `SELECT * FROM bugs ${where}
         ORDER BY
           CASE priority
             WHEN 'critical' THEN 0
             WHEN 'high'     THEN 1
             WHEN 'medium'   THEN 2
             WHEN 'low'      THEN 3
           END ASC,
           created_at DESC`,
    ).all(...values) as Bug[];
}

/**
 * Get a single bug by ID.
 */
export function getBugById(db: Database.Database, id: string): Bug | undefined {
    return db.prepare('SELECT * FROM bugs WHERE id = ?').get(id) as Bug | undefined;
}

/**
 * Read the filesystem content for a bug.
 * Returns null if the content file does not exist.
 */
export function getBugContent(
    db: Database.Database,
    bugId: string,
    projectRoot: string,
): string | null {
    // Ensure the bug actually exists in DB
    const bug = getBugById(db, bugId);
    if (!bug) return null;
    return readBugContent(projectRoot, bugId);
}

/**
 * Update bug fields. Only non-undefined fields are updated.
 *
 * - Sets `resolved_at` when status transitions to 'resolved' or 'closed'.
 * - Sets `updated_at` on every update.
 */
export function updateBug(
    db: Database.Database,
    id: string,
    updates: {
        title?: string;
        description?: string;
        status?: Bug['status'];
        priority?: Bug['priority'];
        assigned_to?: string;
        blocking?: boolean;
        milestone_id?: string;
        phase_id?: string;
        projectRoot?: string;
    },
): Bug {
    const existing = db.prepare('SELECT * FROM bugs WHERE id = ?').get(id) as Bug | undefined;
    if (!existing) {
        throw new Error(`Bug '${id}' not found.`);
    }

    const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];

    if (updates.title !== undefined) {
        setClauses.push('title = ?');
        values.push(updates.title);
    }
    if (updates.description !== undefined) {
        setClauses.push('description = ?');
        values.push(updates.description);
    }
    if (updates.status !== undefined) {
        setClauses.push('status = ?');
        values.push(updates.status);
        if (updates.status === 'resolved' || updates.status === 'closed') {
            setClauses.push('resolved_at = CURRENT_TIMESTAMP');
        }
    }
    if (updates.priority !== undefined) {
        setClauses.push('priority = ?');
        values.push(updates.priority);
    }
    if (updates.assigned_to !== undefined) {
        setClauses.push('assigned_to = ?');
        values.push(updates.assigned_to);
    }
    if (updates.blocking !== undefined) {
        setClauses.push('blocking = ?');
        values.push(updates.blocking ? 1 : 0);
    }
    if (updates.milestone_id !== undefined) {
        setClauses.push('milestone_id = ?');
        values.push(updates.milestone_id);
    }
    if (updates.phase_id !== undefined) {
        setClauses.push('phase_id = ?');
        values.push(updates.phase_id);
    }

    values.push(id);
    db.prepare(`UPDATE bugs SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    return db.prepare('SELECT * FROM bugs WHERE id = ?').get(id) as Bug;
}

/**
 * Get blocking bugs, optionally scoped to a milestone and/or phase.
 * Returns only bugs where blocking = 1 AND status is still active (open, investigating, fixing).
 */
export function getBlockingBugs(
    db: Database.Database,
    milestoneId?: string,
    phaseId?: string,
): Bug[] {
    const conditions: string[] = [
        'blocking = 1',
        "status IN ('open', 'investigating', 'fixing')",
    ];
    const values: any[] = [];

    if (milestoneId) {
        conditions.push('milestone_id = ?');
        values.push(milestoneId);
    }
    if (phaseId) {
        conditions.push('phase_id = ?');
        values.push(phaseId);
    }

    return db.prepare(
        `SELECT * FROM bugs WHERE ${conditions.join(' AND ')}
         ORDER BY
           CASE priority
             WHEN 'critical' THEN 0
             WHEN 'high'     THEN 1
             WHEN 'medium'   THEN 2
             WHEN 'low'      THEN 3
           END ASC,
           created_at DESC`,
    ).all(...values) as Bug[];
}
