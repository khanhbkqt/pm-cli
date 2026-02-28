import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import {
    setContext,
    getContext,
    listContext,
    searchContext,
} from '../src/core/context.js';

describe('context core', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;
    let testAgent: { id: string; name: string };

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-context-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        testAgent = registerAgent(db, { name: 'tester', role: 'developer', type: 'human' });
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // --- setContext ---

    it('setContext creates a new context entry', () => {
        const entry = setContext(db, { key: 'api-url', value: 'https://api.example.com', created_by: testAgent.id });

        expect(entry.key).toBe('api-url');
        expect(entry.value).toBe('https://api.example.com');
        expect(entry.category).toBe('note');
        expect(entry.created_by).toBe(testAgent.id);
        expect(entry.id).toBeDefined();
        expect(entry.created_at).toBeDefined();
    });

    it('setContext upserts (same key overwrites value)', () => {
        setContext(db, { key: 'db-host', value: 'localhost', created_by: testAgent.id });
        const updated = setContext(db, { key: 'db-host', value: 'prod-server', created_by: testAgent.id });

        expect(updated.key).toBe('db-host');
        expect(updated.value).toBe('prod-server');

        // Should still be only one entry
        const all = listContext(db);
        expect(all).toHaveLength(1);
    });

    it('setContext defaults category to note', () => {
        const entry = setContext(db, { key: 'test', value: 'val', created_by: testAgent.id });
        expect(entry.category).toBe('note');
    });

    it('setContext with explicit category', () => {
        const entry = setContext(db, { key: 'arch', value: 'microservices', category: 'decision', created_by: testAgent.id });
        expect(entry.category).toBe('decision');
    });

    it('setContext throws if agent does not exist', () => {
        expect(() => {
            setContext(db, { key: 'bad', value: 'val', created_by: 'nonexistent-id' });
        }).toThrow("Agent 'nonexistent-id' not found.");
    });

    // --- getContext ---

    it('getContext returns entry when found', () => {
        setContext(db, { key: 'found-me', value: 'here', created_by: testAgent.id });
        const entry = getContext(db, 'found-me');

        expect(entry).toBeDefined();
        expect(entry!.value).toBe('here');
    });

    it('getContext returns undefined when not found', () => {
        const entry = getContext(db, 'nonexistent');
        expect(entry).toBeUndefined();
    });

    // --- listContext ---

    it('listContext returns all entries sorted by key ASC', () => {
        setContext(db, { key: 'zebra', value: 'z', created_by: testAgent.id });
        setContext(db, { key: 'alpha', value: 'a', created_by: testAgent.id });

        const entries = listContext(db);
        expect(entries).toHaveLength(2);
        expect(entries[0].key).toBe('alpha');
        expect(entries[1].key).toBe('zebra');
    });

    it('listContext with category filter returns only matching entries', () => {
        setContext(db, { key: 'note1', value: 'n', category: 'note', created_by: testAgent.id });
        setContext(db, { key: 'dec1', value: 'd', category: 'decision', created_by: testAgent.id });

        const notes = listContext(db, { category: 'note' });
        expect(notes).toHaveLength(1);
        expect(notes[0].key).toBe('note1');
    });

    it('listContext returns empty array when no entries exist', () => {
        const entries = listContext(db);
        expect(entries).toHaveLength(0);
    });

    // --- searchContext ---

    it('searchContext matches on key', () => {
        setContext(db, { key: 'api-endpoint', value: 'https://x', created_by: testAgent.id });
        setContext(db, { key: 'db-host', value: 'localhost', created_by: testAgent.id });

        const results = searchContext(db, 'api');
        expect(results).toHaveLength(1);
        expect(results[0].key).toBe('api-endpoint');
    });

    it('searchContext matches on value', () => {
        setContext(db, { key: 'server', value: 'production-east', created_by: testAgent.id });

        const results = searchContext(db, 'production');
        expect(results).toHaveLength(1);
        expect(results[0].key).toBe('server');
    });

    it('searchContext returns empty array when no match', () => {
        setContext(db, { key: 'foo', value: 'bar', created_by: testAgent.id });

        const results = searchContext(db, 'zzz');
        expect(results).toHaveLength(0);
    });
});
