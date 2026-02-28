import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import { resolveIdentity, findProjectRoot, getProjectDb } from '../src/core/identity.js';

describe('identity resolution', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-identity-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        // Register a test agent
        registerAgent(db, { name: 'alice', role: 'developer', type: 'human' });
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
        // Clean up env var
        delete process.env.PM_AGENT;
    });

    it('resolveIdentity with --agent flag resolves correct agent', () => {
        const agent = resolveIdentity(db, { agent: 'alice' });
        expect(agent.name).toBe('alice');
        expect(agent.role).toBe('developer');
    });

    it('resolveIdentity with PM_AGENT env var resolves correct agent', () => {
        process.env.PM_AGENT = 'alice';
        const agent = resolveIdentity(db, {});
        expect(agent.name).toBe('alice');
    });

    it('resolveIdentity with --agent flag takes priority over PM_AGENT', () => {
        registerAgent(db, { name: 'bob', role: 'reviewer', type: 'ai' });
        process.env.PM_AGENT = 'bob';

        const agent = resolveIdentity(db, { agent: 'alice' });
        expect(agent.name).toBe('alice');
    });

    it('resolveIdentity throws when neither flag nor env var set', () => {
        delete process.env.PM_AGENT;
        expect(() => resolveIdentity(db, {})).toThrow(
            'Agent identity required. Use --agent <name> or set PM_AGENT env var.'
        );
    });

    it('resolveIdentity throws when agent name not registered', () => {
        expect(() => resolveIdentity(db, { agent: 'nonexistent' })).toThrow(
            "Agent 'nonexistent' not registered. Run: pm agent register nonexistent"
        );
    });
});

describe('findProjectRoot', () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-root-test-'));
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('finds .pm/ in current directory', () => {
        fs.mkdirSync(path.join(tempDir, '.pm'));
        const root = findProjectRoot(tempDir);
        expect(root).toBe(tempDir);
    });

    it('finds .pm/ in parent directory', () => {
        fs.mkdirSync(path.join(tempDir, '.pm'));
        const subDir = path.join(tempDir, 'sub', 'dir');
        fs.mkdirSync(subDir, { recursive: true });

        const root = findProjectRoot(subDir);
        expect(root).toBe(tempDir);
    });

    it('throws when no .pm/ found', () => {
        // Use a directory without .pm/ anywhere in the ancestry
        const isolatedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-no-root-'));
        try {
            expect(() => findProjectRoot(isolatedDir)).toThrow(
                'Not a PM project. Run: pm init'
            );
        } finally {
            fs.rmSync(isolatedDir, { recursive: true, force: true });
        }
    });
});
