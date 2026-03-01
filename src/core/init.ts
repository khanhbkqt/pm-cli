import fs from 'fs';
import path from 'path';
import { stringify } from 'yaml';
import { getDatabase, createDatabase, initializeSchema, runMigrations } from '../db/index.js';

const PM_DIR = '.pm';
const DB_FILE = 'data.db';
const CONFIG_FILE = 'config.yaml';

/**
 * Initialize a new PM project.
 * Creates .pm/ directory with data.db (SQLite, all tables) and config.yaml.
 */
export async function initProject(name: string, targetDir: string): Promise<void> {
    const pmDir = path.join(targetDir, PM_DIR);

    // If already initialized
    if (fs.existsSync(pmDir)) {
        const dbPath = path.join(pmDir, DB_FILE);
        if (fs.existsSync(dbPath)) {
            // Run schema migrations and report
            const db = createDatabase(dbPath);
            const { migrated, fromVersion, toVersion } = runMigrations(db);
            db.close();

            if (migrated) {
                console.log(`✓ Schema migrated: v${fromVersion} → v${toVersion}`);
            } else {
                console.log(`✓ Schema already up to date (v${toVersion})`);
            }
            return;
        }

        // `.pm/` exists but `data.db` is missing — rebuild DB below
    } else {
        // Create .pm/ directory
        fs.mkdirSync(pmDir, { recursive: true });
    }

    // Create and initialize fresh SQLite database
    const dbPath = path.join(pmDir, DB_FILE);
    const db = getDatabase(dbPath);
    db.close();

    // Create config.yaml with defaults
    const config = {
        project: {
            name,
            created_at: new Date().toISOString(),
            version: 1,
        },
        settings: {
            plan_statuses: ['pending', 'in_progress', 'completed', 'failed'],
            agent_roles: ['developer', 'reviewer', 'pm', 'researcher'],
        },
    };

    const configPath = path.join(pmDir, CONFIG_FILE);
    fs.writeFileSync(configPath, stringify(config), 'utf-8');

    console.log(`✓ Project "${name}" initialized successfully.`);
    console.log(`  Created: ${pmDir}/`);
    console.log(`  Database: ${DB_FILE} (6 tables, WAL mode)`);
    console.log(`  Config: ${CONFIG_FILE}`);
}
