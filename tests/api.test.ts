import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../src/db/schema.js';
import { createApp } from '../src/server/app.js';
import { getAvailablePort } from '../src/server/utils.js';
import { registerAgent } from '../src/core/agent.js';
import { setContext } from '../src/core/context.js';
import type { Server } from 'http';

let db: Database.Database;
let server: Server;
let baseUrl: string;
let testAgentId: string;

beforeAll(async () => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);

    // Register a test agent for API operations
    const agent = registerAgent(db, { name: 'test-agent', role: 'tester', type: 'human' });
    testAgentId = agent.id;

    const app = createApp(db);
    const port = await getAvailablePort(5100);
    server = app.listen(port);
    baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
});


describe('Agent Endpoints', () => {
    it('GET /api/agents — returns registered agents', async () => {
        const res = await fetch(`${baseUrl}/api/agents`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.agents).toBeInstanceOf(Array);
        expect(body.agents.length).toBeGreaterThanOrEqual(1);
        expect(body.agents.some((a: any) => a.name === 'test-agent')).toBe(true);
    });

    it('GET /api/agents/:id — returns agent by id', async () => {
        const res = await fetch(`${baseUrl}/api/agents/${testAgentId}`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.agent.id).toBe(testAgentId);
        expect(body.agent.name).toBe('test-agent');
    });

    it('GET /api/agents/nonexistent — returns 404', async () => {
        const res = await fetch(`${baseUrl}/api/agents/nonexistent-id`);
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toBeDefined();
    });
});

describe('Context Endpoints', () => {
    beforeAll(() => {
        // Seed some context entries for testing
        setContext(db, { key: 'test-key', value: 'test-value', category: 'note', created_by: testAgentId });
        setContext(db, { key: 'decision-1', value: 'use TypeScript', category: 'decision', created_by: testAgentId });
    });

    it('GET /api/context — returns context entries', async () => {
        const res = await fetch(`${baseUrl}/api/context`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.entries).toBeInstanceOf(Array);
        expect(body.entries.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/context?category=note — filters by category', async () => {
        const res = await fetch(`${baseUrl}/api/context?category=note`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.entries).toBeInstanceOf(Array);
        body.entries.forEach((e: any) => expect(e.category).toBe('note'));
    });

    it('GET /api/context/search?q=test — search works', async () => {
        const res = await fetch(`${baseUrl}/api/context/search?q=test`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.entries).toBeInstanceOf(Array);
        expect(body.entries.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/context/search — missing q returns 400', async () => {
        const res = await fetch(`${baseUrl}/api/context/search`);
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBeDefined();
    });
});

describe('Status Endpoint', () => {
    it('GET /api/status — returns project overview', async () => {
        const res = await fetch(`${baseUrl}/api/status`);
        expect(res.status).toBe(200);
        const body = await res.json();

        // Check plans section
        expect(body.plans).toBeDefined();
        expect(typeof body.plans.total).toBe('number');
        expect(body.plans.by_status).toBeDefined();
        expect(typeof body.plans.by_status.pending).toBe('number');
        expect(typeof body.plans.by_status.in_progress).toBe('number');
        expect(typeof body.plans.by_status.completed).toBe('number');
        expect(typeof body.plans.by_status.failed).toBe('number');

        // Check agents section
        expect(body.agents).toBeDefined();
        expect(typeof body.agents.total).toBe('number');
        expect(body.agents.by_type).toBeDefined();

        // Check context section
        expect(body.context).toBeDefined();
        expect(typeof body.context.total).toBe('number');

        // Check recent_plans
        expect(body.recent_plans).toBeInstanceOf(Array);
    });
});

describe('Progress Endpoint', () => {
    it('GET /api/progress — no active milestone returns 404', async () => {
        const res = await fetch(`${baseUrl}/api/progress`);
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toBeDefined();
    });

    it('GET /api/progress — with active milestone returns 200', async () => {
        // Seed: create milestone and activate it
        const { createMilestone, updateMilestone } = await import('../src/core/milestone.js');
        createMilestone(db, { id: 'v-progress-test', name: 'Progress Test', created_by: testAgentId });
        updateMilestone(db, 'v-progress-test', { status: 'active' });

        const res = await fetch(`${baseUrl}/api/progress`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.milestone).toBeDefined();
        expect(body.milestone.id).toBe('v-progress-test');
        expect(body.phases).toBeInstanceOf(Array);
        expect(body.summary).toBeDefined();
        expect(typeof body.summary.phases_total).toBe('number');
        expect(typeof body.summary.phases_complete).toBe('number');
        expect(typeof body.summary.phases_pct).toBe('number');
    });
});
