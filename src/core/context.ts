import type Database from 'better-sqlite3';
import type { ContextEntry } from '../db/types.js';
import { getAgentById } from './agent.js';

/**
 * Set (upsert) a context entry. Uses ON CONFLICT to preserve row identity.
 * Agent identity (created_by) is mandatory and validated.
 */
export function setContext(
    db: Database.Database,
    params: { key: string; value: string; category?: string; created_by: string }
): ContextEntry {
    const { key, value, category, created_by } = params;

    // Validate creator agent exists
    const agent = getAgentById(db, created_by);
    if (!agent) {
        throw new Error(`Agent '${created_by}' not found.`);
    }

    const cat = category ?? 'note';

    db.prepare(
        `INSERT INTO context (key, value, category, created_by)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           category = excluded.category,
           created_by = excluded.created_by,
           updated_at = CURRENT_TIMESTAMP`
    ).run(key, value, cat, created_by);

    return db.prepare('SELECT * FROM context WHERE key = ?').get(key) as ContextEntry;
}

/**
 * Get a single context entry by key.
 * Returns undefined if not found.
 */
export function getContext(db: Database.Database, key: string): ContextEntry | undefined {
    return db.prepare('SELECT * FROM context WHERE key = ?').get(key) as ContextEntry | undefined;
}

/**
 * List all context entries with optional category filter.
 */
export function listContext(
    db: Database.Database,
    filters?: { category?: string }
): ContextEntry[] {
    if (filters?.category) {
        return db.prepare(
            'SELECT * FROM context WHERE category = ? ORDER BY key ASC'
        ).all(filters.category) as ContextEntry[];
    }

    return db.prepare('SELECT * FROM context ORDER BY key ASC').all() as ContextEntry[];
}

/**
 * Search context entries by matching key or value with LIKE query.
 */
export function searchContext(db: Database.Database, query: string): ContextEntry[] {
    const pattern = `%${query}%`;
    return db.prepare(
        'SELECT * FROM context WHERE key LIKE ? OR value LIKE ? ORDER BY key ASC'
    ).all(pattern, pattern) as ContextEntry[];
}
