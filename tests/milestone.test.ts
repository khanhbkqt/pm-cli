import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import {
    createMilestone,
    listMilestones,
    getMilestoneById,
    updateMilestone,
    getActiveMilestone,
} from '../src/core/milestone.js';

describe('milestone core', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;
    let testAgent: { id: string; name: string };

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-milestone-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        testAgent = registerAgent(db, { name: 'tester', role: 'developer', type: 'human' });
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // --- createMilestone ---

    it('createMilestone creates with correct default fields', () => {
        const ms = createMilestone(db, {
            id: 'v1.0',
            name: 'MVP',
            created_by: testAgent.id,
        });

        expect(ms.id).toBe('v1.0');
        expect(ms.name).toBe('MVP');
        expect(ms.goal).toBeNull();
        expect(ms.status).toBe('planned');
        expect(ms.created_by).toBe(testAgent.id);
        expect(ms.created_at).toBeDefined();
        expect(ms.completed_at).toBeNull();
    });

    it('createMilestone with goal', () => {
        const ms = createMilestone(db, {
            id: 'v2.0',
            name: 'Release',
            goal: 'Ship it',
            created_by: testAgent.id,
        });

        expect(ms.goal).toBe('Ship it');
    });

    it('createMilestone throws if agent does not exist', () => {
        expect(() => {
            createMilestone(db, { id: 'v1.0', name: 'MVP', created_by: 'nonexistent' });
        }).toThrow("Creator agent 'nonexistent' not found.");
    });

    // --- listMilestones ---

    it('listMilestones returns all milestones', () => {
        createMilestone(db, { id: 'v1', name: 'One', created_by: testAgent.id });
        createMilestone(db, { id: 'v2', name: 'Two', created_by: testAgent.id });

        const list = listMilestones(db);
        expect(list).toHaveLength(2);
    });

    it('listMilestones with status filter', () => {
        createMilestone(db, { id: 'v1', name: 'One', created_by: testAgent.id });
        const ms = createMilestone(db, { id: 'v2', name: 'Two', created_by: testAgent.id });
        updateMilestone(db, ms.id, { status: 'active' });

        const active = listMilestones(db, { status: 'active' });
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe('v2');
    });

    // --- getMilestoneById ---

    it('getMilestoneById returns milestone when found', () => {
        createMilestone(db, { id: 'v1', name: 'Found', created_by: testAgent.id });

        const found = getMilestoneById(db, 'v1');
        expect(found).toBeDefined();
        expect(found!.name).toBe('Found');
    });

    it('getMilestoneById returns undefined when not found', () => {
        const found = getMilestoneById(db, 'nonexistent');
        expect(found).toBeUndefined();
    });

    // --- updateMilestone ---

    it('updateMilestone updates name and goal', () => {
        createMilestone(db, { id: 'v1', name: 'Old', created_by: testAgent.id });
        const updated = updateMilestone(db, 'v1', { name: 'New', goal: 'Updated goal' });

        expect(updated.name).toBe('New');
        expect(updated.goal).toBe('Updated goal');
    });

    it('updateMilestone sets completed_at when status changes to completed', () => {
        createMilestone(db, { id: 'v1', name: 'MS', created_by: testAgent.id });
        const updated = updateMilestone(db, 'v1', { status: 'completed' });

        expect(updated.status).toBe('completed');
        expect(updated.completed_at).not.toBeNull();
    });

    it('updateMilestone throws if milestone not found', () => {
        expect(() => {
            updateMilestone(db, 'nonexistent', { name: 'Nope' });
        }).toThrow("Milestone 'nonexistent' not found.");
    });

    it('updateMilestone with no updates returns existing milestone', () => {
        createMilestone(db, { id: 'v1', name: 'Same', created_by: testAgent.id });
        const same = updateMilestone(db, 'v1', {});
        expect(same.name).toBe('Same');
    });

    // --- getActiveMilestone ---

    it('getActiveMilestone returns active milestone', () => {
        createMilestone(db, { id: 'v1', name: 'Active', created_by: testAgent.id });
        updateMilestone(db, 'v1', { status: 'active' });

        const active = getActiveMilestone(db);
        expect(active).toBeDefined();
        expect(active!.id).toBe('v1');
    });

    it('getActiveMilestone returns undefined when none active', () => {
        createMilestone(db, { id: 'v1', name: 'Planned', created_by: testAgent.id });

        const active = getActiveMilestone(db);
        expect(active).toBeUndefined();
    });
});
