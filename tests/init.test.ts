import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';
import { parse } from 'yaml';
import { initProject } from '../src/core/init.js';

describe('pm init', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-test-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates .pm directory', async () => {
        await initProject('test-project', tempDir);
        const pmDir = path.join(tempDir, '.pm');
        expect(fs.existsSync(pmDir)).toBe(true);
        expect(fs.statSync(pmDir).isDirectory()).toBe(true);
    });

    it('creates data.db with correct schema', async () => {
        await initProject('test-project', tempDir);
        const dbPath = path.join(tempDir, '.pm', 'data.db');
        expect(fs.existsSync(dbPath)).toBe(true);

        const db = new Database(dbPath);
        const tables = db
            .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
            .all()
            .map((row: any) => row.name);

        expect(tables).toContain('agents');
        expect(tables).not.toContain('tasks');
        expect(tables).not.toContain('task_comments');
        expect(tables).toContain('context');
        db.close();
    });

    it('enables WAL mode', async () => {
        await initProject('test-project', tempDir);
        const dbPath = path.join(tempDir, '.pm', 'data.db');
        const db = new Database(dbPath);
        const result = db.pragma('journal_mode');
        expect(result).toEqual([{ journal_mode: 'wal' }]);
        db.close();
    });

    it('creates config.yaml with project name', async () => {
        await initProject('my-project', tempDir);
        const configPath = path.join(tempDir, '.pm', 'config.yaml');
        expect(fs.existsSync(configPath)).toBe(true);

        const content = fs.readFileSync(configPath, 'utf-8');
        const config = parse(content);

        expect(config.project.name).toBe('my-project');
        expect(config.project.version).toBe(1);
        expect(config.project.created_at).toBeDefined();
        expect(config.settings.plan_statuses).toEqual([
            'pending', 'in_progress', 'completed', 'failed',
        ]);
        expect(config.settings.agent_roles).toEqual([
            'developer', 'reviewer', 'pm', 'researcher',
        ]);
    });

    it('succeeds and migrates if .pm already exists', async () => {
        // Create .pm directory manually
        fs.mkdirSync(path.join(tempDir, '.pm'));

        // Should not throw, should just initialize database inside it
        await expect(initProject('test-project', tempDir)).resolves.not.toThrow();

        // Ensure DB was actually created inside the existing folder
        const dbPath = path.join(tempDir, '.pm', 'data.db');
        expect(fs.existsSync(dbPath)).toBe(true);
    });
});
