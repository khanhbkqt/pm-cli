import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import { createMilestone } from '../src/core/milestone.js';
import { addPhase } from '../src/core/phase.js';
import {
    createPlan,
    listPlans,
    getPlanById,
    updatePlan,
    getPlanContent,
} from '../src/core/plan.js';
import { getPlanContentPath } from '../src/core/content.js';

describe('plan core', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;
    let testAgent: { id: string; name: string };
    let phaseId: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-plan-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        testAgent = registerAgent(db, { name: 'tester', role: 'developer', type: 'human' });
        // Create milestone and phase to attach plans to
        createMilestone(db, { id: 'v1.0', name: 'MVP', created_by: testAgent.id });
        const phase = addPhase(db, { milestone_id: 'v1.0', number: 1, name: 'Foundation' });
        phaseId = phase.id;
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // --- createPlan ---

    it('createPlan creates with correct default fields', () => {
        const plan = createPlan(db, {
            phase_id: phaseId,
            number: 1,
            name: 'Schema',
        });

        expect(plan.phase_id).toBe(phaseId);
        expect(plan.number).toBe(1);
        expect(plan.name).toBe('Schema');
        expect(plan.wave).toBe(1);
        expect(plan.status).toBe('pending');
        expect(plan.content).toBeNull();  // content always null in DB
        expect(plan.created_at).toBeDefined();
        expect(plan.completed_at).toBeNull();
    });

    it('createPlan with wave and content writes to filesystem', () => {
        const plan = createPlan(db, {
            phase_id: phaseId,
            number: 1,
            name: 'Schema',
            wave: 2,
            content: '# Plan content',
            projectRoot: tempDir,
        });

        expect(plan.wave).toBe(2);
        // DB content is always null — stored on filesystem
        expect(plan.content).toBeNull();
        // Verify content was written to file
        const fileContent = getPlanContent(db, plan.id, tempDir);
        expect(fileContent).toBe('# Plan content');
    });

    it('createPlan throws if phase does not exist', () => {
        expect(() => {
            createPlan(db, { phase_id: 'nonexistent-uuid', number: 1, name: 'Bad' });
        }).toThrow("Phase 'nonexistent-uuid' not found.");
    });

    // --- listPlans ---

    it('listPlans returns plans ordered by wave ASC, number ASC', () => {
        createPlan(db, { phase_id: phaseId, number: 2, name: 'W1-Second', wave: 1 });
        createPlan(db, { phase_id: phaseId, number: 3, name: 'W2-First', wave: 2 });
        createPlan(db, { phase_id: phaseId, number: 1, name: 'W1-First', wave: 1 });

        const plans = listPlans(db, phaseId);
        expect(plans).toHaveLength(3);
        expect(plans[0].name).toBe('W1-First');
        expect(plans[1].name).toBe('W1-Second');
        expect(plans[2].name).toBe('W2-First');
    });

    it('listPlans with status filter', () => {
        const p = createPlan(db, { phase_id: phaseId, number: 1, name: 'One' });
        createPlan(db, { phase_id: phaseId, number: 2, name: 'Two' });
        updatePlan(db, p.id, { status: 'in_progress' });

        const inProgress = listPlans(db, phaseId, { status: 'in_progress' });
        expect(inProgress).toHaveLength(1);
        expect(inProgress[0].name).toBe('One');
    });

    it('listPlans with wave filter', () => {
        createPlan(db, { phase_id: phaseId, number: 1, name: 'Wave1', wave: 1 });
        createPlan(db, { phase_id: phaseId, number: 2, name: 'Wave2', wave: 2 });

        const wave2 = listPlans(db, phaseId, { wave: 2 });
        expect(wave2).toHaveLength(1);
        expect(wave2[0].name).toBe('Wave2');
    });

    // --- getPlanById ---

    it('getPlanById returns plan when found', () => {
        const created = createPlan(db, { phase_id: phaseId, number: 1, name: 'Find me' });

        const found = getPlanById(db, created.id);
        expect(found).toBeDefined();
        expect(found!.name).toBe('Find me');
    });

    it('getPlanById returns undefined when not found', () => {
        const found = getPlanById(db, 'nonexistent-uuid');
        expect(found).toBeUndefined();
    });

    // --- updatePlan ---

    it('updatePlan updates name and content via filesystem', () => {
        const plan = createPlan(db, { phase_id: phaseId, number: 1, name: 'Old', projectRoot: tempDir });
        const updated = updatePlan(db, plan.id, { name: 'New', content: '# Updated', projectRoot: tempDir });

        expect(updated.name).toBe('New');
        // DB content always null
        expect(updated.content).toBeNull();
        // File content updated
        const fileContent = getPlanContent(db, plan.id, tempDir);
        expect(fileContent).toBe('# Updated');
    });

    it('updatePlan sets completed_at when status changes to completed', () => {
        const plan = createPlan(db, { phase_id: phaseId, number: 1, name: 'Plan' });
        const updated = updatePlan(db, plan.id, { status: 'completed' });

        expect(updated.status).toBe('completed');
        expect(updated.completed_at).not.toBeNull();
    });

    it('updatePlan updates wave', () => {
        const plan = createPlan(db, { phase_id: phaseId, number: 1, name: 'Plan' });
        const updated = updatePlan(db, plan.id, { wave: 3 });

        expect(updated.wave).toBe(3);
    });

    it('updatePlan throws if plan not found', () => {
        expect(() => {
            updatePlan(db, 'nonexistent-uuid', { name: 'Nope' });
        }).toThrow("Plan 'nonexistent-uuid' not found.");
    });

    it('updatePlan with no updates returns existing plan', () => {
        const plan = createPlan(db, { phase_id: phaseId, number: 1, name: 'Same' });
        const same = updatePlan(db, plan.id, {});
        expect(same.name).toBe('Same');
    });
});

