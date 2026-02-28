import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent, listAgents, getAgentByName, getAgentById } from '../src/core/agent.js';

describe('agent core', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-agent-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('registerAgent creates agent with correct fields', () => {
        const agent = registerAgent(db, { name: 'alice', role: 'developer', type: 'human' });

        expect(agent.name).toBe('alice');
        expect(agent.role).toBe('developer');
        expect(agent.type).toBe('human');
        expect(agent.id).toBeDefined();
        expect(agent.created_at).toBeDefined();
    });

    it('registerAgent rejects duplicate name', () => {
        registerAgent(db, { name: 'alice', role: 'developer', type: 'human' });

        expect(() => {
            registerAgent(db, { name: 'alice', role: 'reviewer', type: 'ai' });
        }).toThrow("Agent 'alice' already exists.");
    });

    it('registerAgent rejects invalid type', () => {
        expect(() => {
            registerAgent(db, { name: 'bob', role: 'developer', type: 'robot' });
        }).toThrow("Invalid agent type: 'robot'. Must be 'human' or 'ai'.");
    });

    it('listAgents returns all agents sorted by created_at DESC', () => {
        registerAgent(db, { name: 'alice', role: 'developer', type: 'human' });
        registerAgent(db, { name: 'bob', role: 'reviewer', type: 'ai' });

        const agents = listAgents(db);

        expect(agents).toHaveLength(2);
        // Both agents returned with correct data
        const names = agents.map(a => a.name);
        expect(names).toContain('alice');
        expect(names).toContain('bob');
    });

    it('getAgentByName returns agent when found', () => {
        registerAgent(db, { name: 'alice', role: 'developer', type: 'human' });

        const agent = getAgentByName(db, 'alice');
        expect(agent).toBeDefined();
        expect(agent!.name).toBe('alice');
        expect(agent!.role).toBe('developer');
    });

    it('getAgentByName returns undefined when not found', () => {
        const agent = getAgentByName(db, 'nonexistent');
        expect(agent).toBeUndefined();
    });

    it('getAgentById returns agent when found', () => {
        const created = registerAgent(db, { name: 'alice', role: 'developer', type: 'human' });

        const agent = getAgentById(db, created.id);
        expect(agent).toBeDefined();
        expect(agent!.id).toBe(created.id);
        expect(agent!.name).toBe('alice');
    });
});
