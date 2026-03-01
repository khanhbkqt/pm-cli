import Database from 'better-sqlite3';
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema.js';

export interface MigrationResult {
    migrated: boolean;
    fromVersion: number;
    toVersion: number;
}

/**
 * Create a new database connection at the given path.
 * Enables WAL mode and foreign keys.
 */
export function createDatabase(dbPath: string): Database.Database {
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
}

/**
 * Initialize the database schema — creates all tables if they don't exist.
 */
export function initializeSchema(db: Database.Database): void {
    db.exec(SCHEMA_SQL);
}

/**
 * Convenience: create database connection and initialize schema in one call.
 */
export function getDatabase(dbPath: string): Database.Database {
    const db = createDatabase(dbPath);
    initializeSchema(db);
    return db;
}

/**
 * Run schema migrations if the database is out of date.
 * Uses PRAGMA user_version to track the schema version.
 */
export function runMigrations(db: Database.Database): MigrationResult {
    const pragmaResult = db.pragma('user_version', { simple: true });
    // better-sqlite3 pragma with { simple: true } returns the value directly for single-column/single-row results
    const user_version = typeof pragmaResult === 'number' ? pragmaResult : 0;

    // Fresh database or already up to date
    if (user_version >= SCHEMA_VERSION) {
        return { migrated: false, fromVersion: user_version, toVersion: user_version };
    }

    let currentVersion = user_version;

    // Disable foreign keys during migration to allow dropping/renaming tables
    // This must be done OUTSIDE the transaction for SQLite
    db.pragma('foreign_keys = OFF');

    // Run migrations in a transaction
    db.transaction(() => {
        if (currentVersion === 0) {
            // Check if tables actually existed with old data
            const hasPhasesOld = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='phases'").get();
            const hasPlansOld = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='plans'").get();

            if (hasPhasesOld) {
                db.exec(`ALTER TABLE phases RENAME TO phases_old;`);
            }
            if (hasPlansOld) {
                db.exec(`ALTER TABLE plans RENAME TO plans_old;`);
            }

            // Recreate tables with correct schemas (via full schema dump ensures consistency)
            db.exec(SCHEMA_SQL);

            if (hasPhasesOld) {
                // Get columns present in old table
                const oldColumns = db.prepare("PRAGMA table_info(phases_old)").all() as { name: string }[];
                const oldColNames = oldColumns.map(c => c.name);

                // Build SELECT based on what exists (e.g. description might be missing in test)
                const phaseSelect = [
                    'CAST(id AS TEXT)',
                    'milestone_id',
                    'number',
                    'name',
                    oldColNames.includes('description') ? 'description' : 'NULL as description',
                    oldColNames.includes('status') ? 'status' : "'not_started' as status",
                    oldColNames.includes('created_at') ? 'created_at' : "CURRENT_TIMESTAMP as created_at",
                    oldColNames.includes('completed_at') ? 'completed_at' : 'NULL as completed_at'
                ].join(', ');

                db.exec(`
                    INSERT INTO phases (id, milestone_id, number, name, description, status, created_at, completed_at)
                    SELECT ${phaseSelect} FROM phases_old;
                    DROP TABLE phases_old;
                `);
            }
            if (hasPlansOld) {
                // Get columns present in old table
                const oldColumns = db.prepare("PRAGMA table_info(plans_old)").all() as { name: string }[];
                const oldColNames = oldColumns.map(c => c.name);

                // Build SELECT based on what exists
                const planSelect = [
                    'CAST(id AS TEXT)',
                    'CAST(phase_id AS TEXT)',
                    'number',
                    'name',
                    oldColNames.includes('wave') ? 'wave' : "1 as wave",
                    oldColNames.includes('status') ? 'status' : "'pending' as status",
                    oldColNames.includes('content') ? 'content' : "NULL as content",
                    oldColNames.includes('created_at') ? 'created_at' : "CURRENT_TIMESTAMP as created_at",
                    oldColNames.includes('completed_at') ? 'completed_at' : 'NULL as completed_at'
                ].join(', ');

                db.exec(`
                    INSERT INTO plans (id, phase_id, number, name, wave, status, content, created_at, completed_at)
                    SELECT ${planSelect} FROM plans_old;
                    DROP TABLE plans_old;
                `);
            }

            currentVersion = 1;
        }

        // Update version after all successful migrations
        db.pragma(`user_version = ${currentVersion}`);
    })();

    // Re-enable foreign keys after transaction
    db.pragma('foreign_keys = ON');

    return {
        migrated: true,
        fromVersion: user_version,
        toVersion: currentVersion
    };
}
