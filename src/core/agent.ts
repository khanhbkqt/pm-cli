import crypto from 'crypto';
import type Database from 'better-sqlite3';
import type { Agent } from '../db/types.js';

/**
 * Register a new agent in the database.
 * Generates a UUID for the agent ID using Node.js built-in crypto.
 */
export function registerAgent(
    db: Database.Database,
    params: { name: string; role: string; type: string }
): Agent {
    const { name, role, type } = params;

    // Validate type
    if (type !== 'human' && type !== 'ai') {
        throw new Error(`Invalid agent type: '${type}'. Must be 'human' or 'ai'.`);
    }

    const id = crypto.randomUUID();

    try {
        db.prepare(
            'INSERT INTO agents (id, name, role, type) VALUES (?, ?, ?, ?)'
        ).run(id, name, role, type);
    } catch (error: any) {
        if (error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            throw new Error(`Agent '${name}' already exists.`);
        }
        throw error;
    }

    return db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as Agent;
}

/**
 * List all agents, ordered by created_at descending.
 */
export function listAgents(db: Database.Database): Agent[] {
    return db.prepare('SELECT * FROM agents ORDER BY created_at DESC').all() as Agent[];
}

/**
 * Find an agent by name.
 */
export function getAgentByName(db: Database.Database, name: string): Agent | undefined {
    return db.prepare('SELECT * FROM agents WHERE name = ?').get(name) as Agent | undefined;
}

/**
 * Find an agent by ID.
 */
export function getAgentById(db: Database.Database, id: string): Agent | undefined {
    return db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as Agent | undefined;
}
