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

    // Register a test agent for task operations
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

describe('Task Endpoints', () => {
    let createdTaskId: number;

    it('POST /api/tasks — creates task, returns 201', async () => {
        const res = await fetch(`${baseUrl}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Test task',
                description: 'A test task',
                priority: 'high',
                created_by: testAgentId,
            }),
        });

        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.task).toBeDefined();
        expect(body.task.title).toBe('Test task');
        expect(body.task.priority).toBe('high');
        createdTaskId = body.task.id;
    });

    it('GET /api/tasks — returns array with created task', async () => {
        const res = await fetch(`${baseUrl}/api/tasks`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.tasks).toBeInstanceOf(Array);
        expect(body.tasks.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/tasks?status=todo — filters by status', async () => {
        const res = await fetch(`${baseUrl}/api/tasks?status=todo`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.tasks).toBeInstanceOf(Array);
        body.tasks.forEach((t: any) => expect(t.status).toBe('todo'));
    });

    it('GET /api/tasks/:id — returns task by id', async () => {
        const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.task.id).toBe(createdTaskId);
        expect(body.task.title).toBe('Test task');
    });

    it('GET /api/tasks/999 — returns 404', async () => {
        const res = await fetch(`${baseUrl}/api/tasks/999`);
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toBeDefined();
    });

    it('PUT /api/tasks/:id — updates title', async () => {
        const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Updated task' }),
        });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.task.title).toBe('Updated task');
    });

    it('POST /api/tasks/:id/assign — assigns agent', async () => {
        const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: testAgentId }),
        });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.task.assigned_to).toBe(testAgentId);
    });

    it('POST /api/tasks/:id/comments — creates comment, returns 201', async () => {
        const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: testAgentId, content: 'Test comment' }),
        });
        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.comment).toBeDefined();
        expect(body.comment.content).toBe('Test comment');
    });

    it('GET /api/tasks/:id/comments — returns comments array', async () => {
        const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}/comments`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.comments).toBeInstanceOf(Array);
        expect(body.comments.length).toBeGreaterThanOrEqual(1);
        expect(body.comments[0].content).toBe('Test comment');
    });
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

        // Check tasks section
        expect(body.tasks).toBeDefined();
        expect(typeof body.tasks.total).toBe('number');
        expect(body.tasks.by_status).toBeDefined();
        expect(typeof body.tasks.by_status.todo).toBe('number');
        expect(typeof body.tasks.by_status.in_progress).toBe('number');
        expect(typeof body.tasks.by_status.done).toBe('number');
        expect(typeof body.tasks.by_status.blocked).toBe('number');
        expect(body.tasks.by_priority).toBeDefined();

        // Check agents section
        expect(body.agents).toBeDefined();
        expect(typeof body.agents.total).toBe('number');
        expect(body.agents.by_type).toBeDefined();

        // Check context section
        expect(body.context).toBeDefined();
        expect(typeof body.context.total).toBe('number');

        // Check recent_tasks
        expect(body.recent_tasks).toBeInstanceOf(Array);
    });
});
