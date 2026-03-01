import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import { createMilestone, getMilestoneById, listMilestones } from '../src/core/milestone.js';
import { addPhase, getPhaseById } from '../src/core/phase.js';
import { createPlan } from '../src/core/plan.js';
import {
    transitionMilestone,
    transitionPhase,
    transitionPlan,
    validateTransition,
    getWorkflowState,
    setWorkflowState,
    listWorkflowState,
    MILESTONE_TRANSITIONS,
    PHASE_TRANSITIONS,
    PLAN_TRANSITIONS,
} from '../src/core/workflow.js';

describe('workflow engine', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;
    let testAgent: { id: string; name: string };

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-workflow-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        testAgent = registerAgent(db, { name: 'tester', role: 'developer', type: 'human' });
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // === validateTransition ===

    describe('validateTransition', () => {
        it('does not throw for valid transitions', () => {
            expect(() => {
                validateTransition('planned', 'active', MILESTONE_TRANSITIONS, 'milestone');
            }).not.toThrow();
        });

        it('throws descriptive error for invalid transition', () => {
            expect(() => {
                validateTransition('planned', 'completed', MILESTONE_TRANSITIONS, 'milestone');
            }).toThrow("Cannot transition milestone from 'planned' to 'completed'. Valid transitions: active");
        });

        it('throws for terminal state with no transitions', () => {
            expect(() => {
                validateTransition('archived', 'planned', MILESTONE_TRANSITIONS, 'milestone');
            }).toThrow("Cannot transition milestone from 'archived' to 'planned'. Valid transitions: (none — terminal state)");
        });
    });

    // === transitionMilestone ===

    describe('transitionMilestone', () => {
        it('valid: planned → active', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            const ms = transitionMilestone(db, 'v1', 'active');
            expect(ms.status).toBe('active');
        });

        it('valid: active → completed (all phases done)', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            transitionMilestone(db, 'v1', 'active');
            const phase = addPhase(db, { milestone_id: 'v1', number: 1, name: 'P1' });
            transitionPhase(db, phase.id, 'in_progress');
            transitionPhase(db, phase.id, 'completed');

            const ms = transitionMilestone(db, 'v1', 'completed');
            expect(ms.status).toBe('completed');
            expect(ms.completed_at).not.toBeNull();
        });

        it('valid: active → archived', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            transitionMilestone(db, 'v1', 'active');
            const ms = transitionMilestone(db, 'v1', 'archived');
            expect(ms.status).toBe('archived');
        });

        it('valid: completed → archived', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            transitionMilestone(db, 'v1', 'active');
            // No phases = can complete
            const completed = transitionMilestone(db, 'v1', 'completed');
            expect(completed.status).toBe('completed');
            const archived = transitionMilestone(db, 'v1', 'archived');
            expect(archived.status).toBe('archived');
        });

        it('invalid: planned → completed throws', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            expect(() => {
                transitionMilestone(db, 'v1', 'completed');
            }).toThrow("Cannot transition milestone from 'planned' to 'completed'");
        });

        it('activating milestone deactivates current active', () => {
            createMilestone(db, { id: 'v1', name: 'MS1', created_by: testAgent.id });
            createMilestone(db, { id: 'v2', name: 'MS2', created_by: testAgent.id });
            transitionMilestone(db, 'v1', 'active');
            transitionMilestone(db, 'v2', 'active');

            // v1 should be deactivated
            const v1 = getMilestoneById(db, 'v1');
            expect(v1!.status).toBe('planned');
        });

        it('only one active milestone at a time', () => {
            createMilestone(db, { id: 'v1', name: 'MS1', created_by: testAgent.id });
            createMilestone(db, { id: 'v2', name: 'MS2', created_by: testAgent.id });
            createMilestone(db, { id: 'v3', name: 'MS3', created_by: testAgent.id });

            transitionMilestone(db, 'v1', 'active');
            transitionMilestone(db, 'v2', 'active');

            const active = listMilestones(db, { status: 'active' });
            expect(active).toHaveLength(1);
            expect(active[0].id).toBe('v2');
        });

        it('completing milestone with incomplete phases throws', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            transitionMilestone(db, 'v1', 'active');
            addPhase(db, { milestone_id: 'v1', number: 1, name: 'Undone' });

            expect(() => {
                transitionMilestone(db, 'v1', 'completed');
            }).toThrow('Cannot complete milestone');
        });

        it('completing milestone with all skipped phases succeeds', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            transitionMilestone(db, 'v1', 'active');
            const phase = addPhase(db, { milestone_id: 'v1', number: 1, name: 'Skipped' });
            transitionPhase(db, phase.id, 'skipped');

            const ms = transitionMilestone(db, 'v1', 'completed');
            expect(ms.status).toBe('completed');
        });

        it('force flag bypasses validation', () => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            // planned → completed is normally invalid
            const ms = transitionMilestone(db, 'v1', 'completed', { force: true });
            expect(ms.status).toBe('completed');
        });

        it('throws if milestone not found', () => {
            expect(() => {
                transitionMilestone(db, 'nonexistent', 'active');
            }).toThrow("Milestone 'nonexistent' not found.");
        });
    });

    // === transitionPhase ===

    describe('transitionPhase', () => {
        let phaseId: string;

        beforeEach(() => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            const phase = addPhase(db, { milestone_id: 'v1', number: 1, name: 'P1' });
            phaseId = phase.id;
        });

        it('valid: not_started → planning → in_progress → completed', () => {
            let p = transitionPhase(db, phaseId, 'planning');
            expect(p.status).toBe('planning');

            p = transitionPhase(db, phaseId, 'in_progress');
            expect(p.status).toBe('in_progress');

            p = transitionPhase(db, phaseId, 'completed');
            expect(p.status).toBe('completed');
            expect(p.completed_at).not.toBeNull();
        });

        it('valid: not_started → in_progress (skip planning)', () => {
            const p = transitionPhase(db, phaseId, 'in_progress');
            expect(p.status).toBe('in_progress');
        });

        it('valid: not_started → skipped', () => {
            const p = transitionPhase(db, phaseId, 'skipped');
            expect(p.status).toBe('skipped');
        });

        it('valid: skipped → not_started (un-skip)', () => {
            transitionPhase(db, phaseId, 'skipped');
            const p = transitionPhase(db, phaseId, 'not_started');
            expect(p.status).toBe('not_started');
        });

        it('invalid: not_started → completed throws', () => {
            expect(() => {
                transitionPhase(db, phaseId, 'completed');
            }).toThrow("Cannot transition phase from 'not_started' to 'completed'");
        });

        it('invalid: completed is terminal', () => {
            transitionPhase(db, phaseId, 'in_progress');
            transitionPhase(db, phaseId, 'completed');
            expect(() => {
                transitionPhase(db, phaseId, 'in_progress');
            }).toThrow("Cannot transition phase from 'completed'");
        });

        it('force flag bypasses validation', () => {
            const p = transitionPhase(db, phaseId, 'completed', { force: true });
            expect(p.status).toBe('completed');
        });

        it('throws if phase not found', () => {
            expect(() => {
                transitionPhase(db, 'nonexistent-uuid', 'planning');
            }).toThrow("Phase 'nonexistent-uuid' not found.");
        });
    });

    // === transitionPlan ===

    describe('transitionPlan', () => {
        let phaseId: string;
        let planId: string;

        beforeEach(() => {
            createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
            const phase = addPhase(db, { milestone_id: 'v1', number: 1, name: 'P1' });
            phaseId = phase.id;
            const plan = createPlan(db, { phase_id: phaseId, number: 1, name: 'Plan1' });
            planId = plan.id;
        });

        it('valid: pending → in_progress → completed', () => {
            let p = transitionPlan(db, planId, 'in_progress');
            expect(p.status).toBe('in_progress');

            p = transitionPlan(db, planId, 'completed');
            expect(p.status).toBe('completed');
            expect(p.completed_at).not.toBeNull();
        });

        it('valid: in_progress → failed', () => {
            transitionPlan(db, planId, 'in_progress');
            const p = transitionPlan(db, planId, 'failed');
            expect(p.status).toBe('failed');
        });

        it('valid: failed → pending (retry)', () => {
            transitionPlan(db, planId, 'in_progress');
            transitionPlan(db, planId, 'failed');
            const p = transitionPlan(db, planId, 'pending');
            expect(p.status).toBe('pending');
        });

        it('invalid: pending → completed throws', () => {
            expect(() => {
                transitionPlan(db, planId, 'completed');
            }).toThrow("Cannot transition plan from 'pending' to 'completed'");
        });

        it('invalid: completed is terminal', () => {
            transitionPlan(db, planId, 'in_progress');
            transitionPlan(db, planId, 'completed');
            expect(() => {
                transitionPlan(db, planId, 'in_progress');
            }).toThrow("Cannot transition plan from 'completed'");
        });

        it('cascade: plan in_progress auto-starts phase', () => {
            // Phase should be not_started initially
            let phase = getPhaseById(db, phaseId);
            expect(phase!.status).toBe('not_started');

            transitionPlan(db, planId, 'in_progress');

            phase = getPhaseById(db, phaseId);
            expect(phase!.status).toBe('in_progress');
        });

        it('cascade: phase already in_progress — plan start does not re-trigger', () => {
            transitionPhase(db, phaseId, 'in_progress');
            const plan2 = createPlan(db, { phase_id: phaseId, number: 2, name: 'Plan2' });

            // Starting plan2 should not error or re-transition phase
            const p = transitionPlan(db, plan2.id, 'in_progress');
            expect(p.status).toBe('in_progress');

            const phase = getPhaseById(db, phaseId);
            expect(phase!.status).toBe('in_progress');
        });

        it('cascade: all plans completed auto-completes phase', () => {
            const plan2 = createPlan(db, { phase_id: phaseId, number: 2, name: 'Plan2' });

            transitionPlan(db, planId, 'in_progress');
            transitionPlan(db, planId, 'completed');

            // Phase should still be in_progress (plan2 not done)
            let phase = getPhaseById(db, phaseId);
            expect(phase!.status).toBe('in_progress');

            transitionPlan(db, plan2.id, 'in_progress');
            transitionPlan(db, plan2.id, 'completed');

            // Now all plans completed — phase should auto-complete
            phase = getPhaseById(db, phaseId);
            expect(phase!.status).toBe('completed');
        });

        it('force flag bypasses validation', () => {
            const p = transitionPlan(db, planId, 'completed', { force: true });
            expect(p.status).toBe('completed');
        });

        it('throws if plan not found', () => {
            expect(() => {
                transitionPlan(db, 'nonexistent-uuid', 'in_progress');
            }).toThrow("Plan 'nonexistent-uuid' not found.");
        });
    });

    // === Workflow State CRUD ===

    describe('workflow state', () => {
        it('setWorkflowState creates new key', () => {
            const ws = setWorkflowState(db, 'current_milestone', 'v1', testAgent.id);
            expect(ws.key).toBe('current_milestone');
            expect(ws.value).toBe('v1');
            expect(ws.updated_by).toBe(testAgent.id);
            expect(ws.updated_at).toBeDefined();
        });

        it('setWorkflowState upserts existing key', () => {
            setWorkflowState(db, 'current_milestone', 'v1', testAgent.id);
            const ws = setWorkflowState(db, 'current_milestone', 'v2', testAgent.id);
            expect(ws.value).toBe('v2');
        });

        it('getWorkflowState returns value', () => {
            setWorkflowState(db, 'current_phase', '3', testAgent.id);
            const val = getWorkflowState(db, 'current_phase');
            expect(val).toBe('3');
        });

        it('getWorkflowState returns undefined for missing key', () => {
            const val = getWorkflowState(db, 'nonexistent');
            expect(val).toBeUndefined();
        });

        it('listWorkflowState returns all entries ordered by key', () => {
            setWorkflowState(db, 'z_key', 'z', testAgent.id);
            setWorkflowState(db, 'a_key', 'a', testAgent.id);

            const list = listWorkflowState(db);
            expect(list).toHaveLength(2);
            expect(list[0].key).toBe('a_key');
            expect(list[1].key).toBe('z_key');
        });

        it('setWorkflowState throws if agent not found', () => {
            expect(() => {
                setWorkflowState(db, 'key', 'val', 'nonexistent');
            }).toThrow("Agent 'nonexistent' not found.");
        });
    });
});
