import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA_SQL } from '../src/db/schema.js';
import { createApp } from '../src/server/app.js';
import { getAvailablePort } from '../src/server/utils.js';
import { registerAgent } from '../src/core/agent.js';
import { createMilestone, updateMilestone } from '../src/core/milestone.js';
import { addPhase, updatePhase } from '../src/core/phase.js';
import { createPlan, updatePlan } from '../src/core/plan.js';
import type { Server } from 'http';

let db: Database.Database;
let server: Server;
let baseUrl: string;
let testAgentId: string;
let milestoneId: string;
let phaseId: number;
let planId: number;

beforeAll(async () => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);

    // Seed test data
    const agent = registerAgent(db, { name: 'api-test-agent', role: 'tester', type: 'human' });
    testAgentId = agent.id;

    const milestone = createMilestone(db, { id: 'v-api-test', name: 'API Test Milestone', goal: 'Test endpoints', created_by: testAgentId });
    milestoneId = milestone.id;

    const phase = addPhase(db, { milestone_id: milestoneId, number: 1, name: 'Phase One', description: 'First phase' });
    phaseId = phase.id;

    const plan = createPlan(db, { phase_id: phaseId, number: 1, name: 'Plan Alpha', wave: 1, content: 'Do things' });
    planId = plan.id;

    const app = createApp(db);
    const port = await getAvailablePort(5200);
    server = app.listen(port);
    baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
});

// ─── Milestone Endpoints ────────────────────────────────────────────

describe('Milestone Endpoints', () => {
    it('GET /api/milestones — returns milestones', async () => {
        const res = await fetch(`${baseUrl}/api/milestones`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.milestones).toBeInstanceOf(Array);
        expect(body.milestones.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/milestones?status=planned — filters by status', async () => {
        const res = await fetch(`${baseUrl}/api/milestones?status=planned`);
        expect(res.status).toBe(200);
        const body = await res.json();
        body.milestones.forEach((m: any) => expect(m.status).toBe('planned'));
    });

    it('GET /api/milestones/active — returns 404 when no active milestone', async () => {
        // Default milestone is 'planned', not 'active'
        const res = await fetch(`${baseUrl}/api/milestones/active`);
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toBeDefined();
    });

    it('GET /api/milestones/active — returns active milestone with phase summary', async () => {
        // Activate the milestone
        updateMilestone(db, milestoneId, { status: 'active' });

        const res = await fetch(`${baseUrl}/api/milestones/active`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.milestone.id).toBe(milestoneId);
        expect(body.phases_summary).toBeDefined();
        expect(typeof body.phases_summary.total).toBe('number');
        expect(typeof body.phases_summary.completed).toBe('number');
        expect(typeof body.phases_summary.in_progress).toBe('number');
        expect(typeof body.phases_summary.not_started).toBe('number');
    });

    it('GET /api/milestones/:id — returns 404 for non-existent', async () => {
        const res = await fetch(`${baseUrl}/api/milestones/nonexistent`);
        expect(res.status).toBe(404);
    });

    it('GET /api/milestones/:id — returns milestone with phase count', async () => {
        const res = await fetch(`${baseUrl}/api/milestones/${milestoneId}`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.milestone.id).toBe(milestoneId);
        expect(typeof body.phases_total).toBe('number');
        expect(body.phases_total).toBeGreaterThanOrEqual(1);
    });
});

// ─── Phase Endpoints ────────────────────────────────────────────────

describe('Phase Endpoints', () => {
    it('GET /api/milestones/:milestoneId/phases — returns phases', async () => {
        const res = await fetch(`${baseUrl}/api/milestones/${milestoneId}/phases`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.phases).toBeInstanceOf(Array);
        expect(body.phases.length).toBeGreaterThanOrEqual(1);
        // Should be enriched with plan counts
        expect(typeof body.phases[0].plans_total).toBe('number');
        expect(typeof body.phases[0].plans_done).toBe('number');
    });

    it('GET /api/milestones/:milestoneId/phases?status=not_started — filters by status', async () => {
        const res = await fetch(`${baseUrl}/api/milestones/${milestoneId}/phases?status=not_started`);
        expect(res.status).toBe(200);
        const body = await res.json();
        body.phases.forEach((p: any) => expect(p.status).toBe('not_started'));
    });

    it('GET /api/phases/:id — returns phase with plans', async () => {
        const res = await fetch(`${baseUrl}/api/phases/${phaseId}`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.phase.id).toBe(phaseId);
        expect(body.plans).toBeInstanceOf(Array);
        expect(body.plans.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/phases/99999 — returns 404 for non-existent', async () => {
        const res = await fetch(`${baseUrl}/api/phases/99999`);
        expect(res.status).toBe(404);
    });
});

// ─── Plan Endpoints ─────────────────────────────────────────────────

describe('Plan Endpoints', () => {
    it('GET /api/phases/:phaseId/plans — returns plans', async () => {
        const res = await fetch(`${baseUrl}/api/phases/${phaseId}/plans`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.plans).toBeInstanceOf(Array);
        expect(body.plans.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/phases/:phaseId/plans?status=pending — filters by status', async () => {
        const res = await fetch(`${baseUrl}/api/phases/${phaseId}/plans?status=pending`);
        expect(res.status).toBe(200);
        const body = await res.json();
        body.plans.forEach((p: any) => expect(p.status).toBe('pending'));
    });

    it('GET /api/phases/:phaseId/plans?wave=1 — filters by wave', async () => {
        const res = await fetch(`${baseUrl}/api/phases/${phaseId}/plans?wave=1`);
        expect(res.status).toBe(200);
        const body = await res.json();
        body.plans.forEach((p: any) => expect(p.wave).toBe(1));
    });

    it('GET /api/plans/:id — returns plan', async () => {
        const res = await fetch(`${baseUrl}/api/plans/${planId}`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.plan.id).toBe(planId);
        expect(body.plan.name).toBe('Plan Alpha');
    });

    it('GET /api/plans/99999 — returns 404 for non-existent', async () => {
        const res = await fetch(`${baseUrl}/api/plans/99999`);
        expect(res.status).toBe(404);
    });
});
