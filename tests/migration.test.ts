import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';
import { runMigrations } from '../src/db/connection.js';
import { SCHEMA_VERSION } from '../src/db/schema.js';

describe('Database Migration', () => {
    let tempDir: string;
    let dbPath: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-migration-test-'));
        dbPath = path.join(tempDir, 'data.db');
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('runMigrations is a no-op on fresh up-to-date db', () => {
        const db = new Database(dbPath);
        db.pragma(`user_version = ${SCHEMA_VERSION}`);

        const result = runMigrations(db);

        expect(result.migrated).toBe(false);
        expect(result.fromVersion).toBe(SCHEMA_VERSION);
        expect(result.toVersion).toBe(SCHEMA_VERSION);

        db.close();
    });

    it('upgrades v0 to v1 and migrates old integer PKs to text UUIDs', () => {
        const db = new Database(dbPath);

        db.exec(`
            CREATE TABLE milestones (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL
            );
        `);
        // 1. Setup a "v0" schema (INTEGER PKs)
        db.pragma('user_version = 0');
        db.pragma('foreign_keys = OFF');
        db.exec(`
            CREATE TABLE phases (
                id INTEGER PRIMARY KEY,
                milestone_id TEXT NOT NULL,
                number INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'not_started',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            );
            
            CREATE TABLE plans (
                id INTEGER PRIMARY KEY,
                phase_id INTEGER NOT NULL,
                number INTEGER NOT NULL,
                name TEXT NOT NULL,
                wave INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'pending',
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            );
        `);

        // 2. Insert some v0 data
        db.exec(`
            INSERT INTO milestones (id, name) VALUES ('m1', 'v0 milestone');
            INSERT INTO phases (id, milestone_id, number, name) VALUES (42, 'm1', 1, 'v0 phase');
            INSERT INTO plans (id, phase_id, number, name) VALUES (99, 42, 1, 'v0 plan');
        `);

        // 3. Run migrations
        const result = runMigrations(db);

        // 4. Assert migration result
        expect(result.migrated).toBe(true);
        expect(result.fromVersion).toBe(0);
        // v0→v1 (UUID migration) + v1→v2 (null plan content) both run
        expect(result.toVersion).toBe(2);

        // 5. Assert database version updated
        const user_version = db.pragma('user_version', { simple: true }) as number;
        expect(user_version).toBe(2);

        // 6. Assert data was migrated and types changed
        const phase = db.prepare('SELECT * FROM phases').get() as any;
        expect(phase.id).toBe('42');            // Inherited as string
        expect(typeof phase.id).toBe('string');
        expect(phase.name).toBe('v0 phase');

        const plan = db.prepare('SELECT * FROM plans').get() as any;
        expect(plan.id).toBe('99');             // Inherited as string
        expect(typeof plan.id).toBe('string');
        expect(plan.phase_id).toBe('42');       // Phase ID updated to string
        expect(plan.name).toBe('v0 plan');

        db.close();
    });

    it('runMigrations is idempotent', () => {
        const db = new Database(dbPath);
        db.pragma('user_version = 0');
        db.exec(`
            CREATE TABLE phases (id INTEGER PRIMARY KEY, milestone_id TEXT, number INTEGER, name TEXT);
            CREATE TABLE plans (id INTEGER PRIMARY KEY, phase_id INTEGER, number INTEGER, name TEXT);
        `);

        // First run
        const result1 = runMigrations(db);
        expect(result1.migrated).toBe(true);

        // Second run
        const result2 = runMigrations(db);
        expect(result2.migrated).toBe(false);
        expect(result2.fromVersion).toBe(2);

        db.close();
    });
});
