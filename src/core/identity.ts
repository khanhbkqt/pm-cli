import path from 'path';
import fs from 'fs';
import type Database from 'better-sqlite3';
import type { Agent } from '../db/types.js';
import { getAgentByName } from './agent.js';
import { getDatabase } from '../db/index.js';

const PM_DIR = '.pm';
const DB_FILE = 'data.db';

/**
 * Resolve agent identity from --agent flag or PM_AGENT env var.
 * Priority: options.agent > process.env.PM_AGENT
 * Returns validated Agent object or throws.
 */
export function resolveIdentity(
    db: Database.Database,
    options: { agent?: string }
): Agent {
    const agentName = options.agent || process.env.PM_AGENT;

    if (!agentName) {
        throw new Error(
            'Agent identity required. Use --agent <name> or set PM_AGENT env var.'
        );
    }

    const agent = getAgentByName(db, agentName);

    if (!agent) {
        throw new Error(
            `Agent '${agentName}' not registered. Run: pm agent register ${agentName}`
        );
    }

    return agent;
}

/**
 * Walk up from startDir looking for .pm/ directory.
 * Returns the directory containing .pm/ or throws if not found.
 */
export function findProjectRoot(startDir?: string): string {
    let current = startDir || process.cwd();

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const pmPath = path.join(current, PM_DIR);
        if (fs.existsSync(pmPath) && fs.statSync(pmPath).isDirectory()) {
            return current;
        }

        const parent = path.dirname(current);
        if (parent === current) {
            // Reached filesystem root
            throw new Error('Not a PM project. Run: pm init');
        }
        current = parent;
    }
}

/**
 * Convenience: locate project root and return a Database connection.
 */
export function getProjectDb(startDir?: string): Database.Database {
    const root = findProjectRoot(startDir);
    return getDatabase(path.join(root, PM_DIR, DB_FILE));
}
