import fs from 'fs';
import path from 'path';
import { stringify } from 'yaml';
import { getDatabase, createDatabase, initializeSchema, runMigrations } from '../db/index.js';
import { getGsdTemplatesDir } from './install/template.js';

const PM_DIR = '.pm';
const DB_FILE = 'data.db';
const CONFIG_FILE = 'config.yaml';
const TEMPLATES_DIR = 'templates';

/**
 * Copy canonical GSD templates into the project's .pm/templates/ directory.
 * Skips files that already exist (allows user customization to persist).
 */
function copyTemplates(targetDir: string): number {
    const destDir = path.join(targetDir, PM_DIR, TEMPLATES_DIR);
    let srcDir: string;

    try {
        srcDir = getGsdTemplatesDir();
    } catch {
        // Templates not found (e.g. minimal install) — skip silently
        return 0;
    }

    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
    let copied = 0;

    for (const file of files) {
        const destPath = path.join(destDir, file);
        if (!fs.existsSync(destPath)) {
            fs.copyFileSync(path.join(srcDir, file), destPath);
            copied++;
        }
    }

    return copied;
}

/**
 * Initialize a new PM project.
 * Creates .pm/ directory with data.db (SQLite, all tables), config.yaml, and templates.
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

            // Copy any new templates that don't exist yet
            const copied = copyTemplates(targetDir);
            if (copied > 0) {
                console.log(`✓ ${copied} new template(s) added to .pm/templates/`);
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

    // Copy GSD templates
    const copied = copyTemplates(targetDir);

    console.log(`✓ Project "${name}" initialized successfully.`);
    console.log(`  Created: ${pmDir}/`);
    console.log(`  Database: ${DB_FILE} (6 tables, WAL mode)`);
    console.log(`  Config: ${CONFIG_FILE}`);
    if (copied > 0) {
        console.log(`  Templates: ${copied} files in .pm/templates/`);
    }
}

