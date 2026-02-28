import Database from 'better-sqlite3';
import { SCHEMA_SQL } from './schema.js';

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
