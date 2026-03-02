import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import { createMilestone } from '../src/core/milestone.js';
import { getPhaseContentPath } from '../src/core/content.js';
import {
    addPhase,
    listPhases,
    getPhaseById,
    updatePhase,
    getPhaseByNumber,
} from '../src/core/phase.js';

describe('phase core', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;
    let testAgent: { id: string; name: string };
    let milestoneId: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-phase-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        testAgent = registerAgent(db, { name: 'tester', role: 'developer', type: 'human' });
        // Create a milestone to attach phases to
        createMilestone(db, { id: 'v1.0', name: 'MVP', created_by: testAgent.id });
        milestoneId = 'v1.0';
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // --- addPhase ---

    it('addPhase creates phase with correct default fields', () => {
        const phase = addPhase(db, {
            milestone_id: milestoneId,
            number: 1,
            name: 'Foundation',
        });

        expect(phase.milestone_id).toBe(milestoneId);
        expect(phase.number).toBe(1);
        expect(phase.name).toBe('Foundation');
        expect(phase.description).toBeNull();
        expect(phase.status).toBe('not_started');
        expect(phase.created_at).toBeDefined();
        expect(phase.completed_at).toBeNull();
    });

    it('addPhase with description', () => {
        const phase = addPhase(db, {
            milestone_id: milestoneId,
            number: 1,
            name: 'Foundation',
            description: 'Setup project structure',
        });

        expect(phase.description).toBe('Setup project structure');
    });

    it('addPhase throws if milestone does not exist', () => {
        expect(() => {
            addPhase(db, { milestone_id: 'nonexistent', number: 1, name: 'Bad' });
        }).toThrow("Milestone 'nonexistent' not found.");
    });

    // --- listPhases ---

    it('listPhases returns phases ordered by number ASC', () => {
        addPhase(db, { milestone_id: milestoneId, number: 2, name: 'Second' });
        addPhase(db, { milestone_id: milestoneId, number: 1, name: 'First' });

        const phases = listPhases(db, milestoneId);
        expect(phases).toHaveLength(2);
        expect(phases[0].name).toBe('First');
        expect(phases[1].name).toBe('Second');
    });

    it('listPhases with status filter', () => {
        const p1 = addPhase(db, { milestone_id: milestoneId, number: 1, name: 'One' });
        addPhase(db, { milestone_id: milestoneId, number: 2, name: 'Two' });
        updatePhase(db, p1.id, { status: 'in_progress' });

        const inProgress = listPhases(db, milestoneId, { status: 'in_progress' });
        expect(inProgress).toHaveLength(1);
        expect(inProgress[0].name).toBe('One');
    });

    // --- getPhaseById ---

    it('getPhaseById returns phase when found', () => {
        const created = addPhase(db, { milestone_id: milestoneId, number: 1, name: 'Find me' });

        const found = getPhaseById(db, created.id);
        expect(found).toBeDefined();
        expect(found!.name).toBe('Find me');
    });

    it('getPhaseById returns undefined when not found', () => {
        const found = getPhaseById(db, 'nonexistent-uuid');
        expect(found).toBeUndefined();
    });

    // --- updatePhase ---

    it('updatePhase updates name and description', () => {
        const phase = addPhase(db, { milestone_id: milestoneId, number: 1, name: 'Old' });
        const updated = updatePhase(db, phase.id, { name: 'New', description: 'Updated' });

        expect(updated.name).toBe('New');
        expect(updated.description).toBe('Updated');
    });

    it('updatePhase sets completed_at when status changes to completed', () => {
        const phase = addPhase(db, { milestone_id: milestoneId, number: 1, name: 'Phase' });
        const updated = updatePhase(db, phase.id, { status: 'completed' });

        expect(updated.status).toBe('completed');
        expect(updated.completed_at).not.toBeNull();
    });

    it('updatePhase throws if phase not found', () => {
        expect(() => {
            updatePhase(db, 'nonexistent-uuid', { name: 'Nope' });
        }).toThrow("Phase 'nonexistent-uuid' not found.");
    });

    it('updatePhase with no updates returns existing phase', () => {
        const phase = addPhase(db, { milestone_id: milestoneId, number: 1, name: 'Same' });
        const same = updatePhase(db, phase.id, {});
        expect(same.name).toBe('Same');
    });

    // --- getPhaseByNumber ---

    it('getPhaseByNumber returns correct phase', () => {
        addPhase(db, { milestone_id: milestoneId, number: 1, name: 'First' });
        addPhase(db, { milestone_id: milestoneId, number: 2, name: 'Second' });

        const phase = getPhaseByNumber(db, milestoneId, 2);
        expect(phase).toBeDefined();
        expect(phase!.name).toBe('Second');
    });

    it('getPhaseByNumber returns undefined when not found', () => {
        const phase = getPhaseByNumber(db, milestoneId, 99);
        expect(phase).toBeUndefined();
    });

    // --- addPhase template generation ---

    it('addPhase with projectRoot writes PHASE.md from template when template exists', () => {
        const tplDir = path.join(tempDir, '.pm', 'templates');
        fs.mkdirSync(tplDir, { recursive: true });
        fs.writeFileSync(
            path.join(tplDir, 'phase-summary.md'),
            '# Phase {N}: {Phase Name}\n\n**Status**: Not Started\n**Created**: YYYY-MM-DD\n\n## Objective\n{What this phase set out to accomplish.}\n',
        );

        const phase = addPhase(db, {
            milestone_id: milestoneId,
            number: 1,
            name: 'Template Phase',
            projectRoot: tempDir,
        });

        const contentPath = getPhaseContentPath(tempDir, milestoneId, phase.number);
        expect(fs.existsSync(contentPath)).toBe(true);
        const written = fs.readFileSync(contentPath, 'utf-8');
        expect(written).toContain('Phase 1:');
        expect(written).toContain('Template Phase');
        expect(written).not.toContain('{N}');
        expect(written).not.toContain('{Phase Name}');
        expect(written).not.toContain('YYYY-MM-DD');
    });

    it('addPhase with projectRoot silently skips if no template', () => {
        const phase = addPhase(db, {
            milestone_id: milestoneId,
            number: 2,
            name: 'No Template Phase',
            projectRoot: tempDir,
        });

        const contentPath = getPhaseContentPath(tempDir, milestoneId, phase.number);
        expect(fs.existsSync(contentPath)).toBe(false);
    });
});

