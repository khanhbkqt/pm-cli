import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import { createMilestone } from '../src/core/milestone.js';
import { addPhase } from '../src/core/phase.js';
import {
    reportBug,
    listBugs,
    getBugById,
    getBugContent,
    updateBug,
    getBlockingBugs,
} from '../src/core/bug.js';
import { getBugContentPath } from '../src/core/content.js';

describe('bug core', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;
    let testAgent: { id: string; name: string };
    let milestoneId: string;
    let phaseId: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-bug-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        testAgent = registerAgent(db, { name: 'tester', role: 'developer', type: 'human' });
        // Create milestone and phase for linking
        createMilestone(db, { id: 'v1.0', name: 'MVP', created_by: testAgent.id });
        milestoneId = 'v1.0';
        const phase = addPhase(db, { milestone_id: milestoneId, number: 1, name: 'Foundation' });
        phaseId = phase.id;
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // --- reportBug ---

    it('reportBug creates with correct defaults (status=open, priority=medium, blocking=0)', () => {
        const bug = reportBug(db, {
            title: 'Login broken',
            reported_by: testAgent.id,
        });

        expect(bug.title).toBe('Login broken');
        expect(bug.status).toBe('open');
        expect(bug.priority).toBe('medium');
        expect(bug.blocking).toBe(0);
        expect(bug.description).toBeNull();
        expect(bug.assigned_to).toBeNull();
        expect(bug.milestone_id).toBeNull();
        expect(bug.phase_id).toBeNull();
        expect(bug.created_at).toBeDefined();
        expect(bug.resolved_at).toBeNull();
    });

    it('reportBug with projectRoot writes template to .pm/bugs/<id>.md', () => {
        // Set up template
        const tplDir = path.join(tempDir, 'docs', 'templates');
        fs.mkdirSync(tplDir, { recursive: true });
        fs.writeFileSync(
            path.join(tplDir, 'BUG.md'),
            '---\ntitle: "{Title}"\npriority: "{Priority}"\n---\n\n# {Title}\n\n## Summary\n\n{Title}\n',
        );

        const bug = reportBug(db, {
            title: 'Crash on save',
            reported_by: testAgent.id,
            projectRoot: tempDir,
        });

        const filePath = getBugContentPath(tempDir, bug.id);
        expect(fs.existsSync(filePath)).toBe(true);
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('Crash on save');
        expect(content).toContain('medium');
    });

    it('reportBug with all options (priority, description, milestone_id, phase_id, blocking)', () => {
        const bug = reportBug(db, {
            title: 'Critical failure',
            description: 'App crashes on startup',
            priority: 'critical',
            reported_by: testAgent.id,
            milestone_id: milestoneId,
            phase_id: phaseId,
            blocking: true,
        });

        expect(bug.title).toBe('Critical failure');
        expect(bug.description).toBe('App crashes on startup');
        expect(bug.priority).toBe('critical');
        expect(bug.milestone_id).toBe(milestoneId);
        expect(bug.phase_id).toBe(phaseId);
        expect(bug.blocking).toBe(1);
    });

    // --- listBugs ---

    it('listBugs returns all bugs ordered by priority then created_at', () => {
        reportBug(db, { title: 'Low bug', priority: 'low', reported_by: testAgent.id });
        reportBug(db, { title: 'Critical bug', priority: 'critical', reported_by: testAgent.id });
        reportBug(db, { title: 'High bug', priority: 'high', reported_by: testAgent.id });

        const bugs = listBugs(db);
        expect(bugs).toHaveLength(3);
        expect(bugs[0].title).toBe('Critical bug');
        expect(bugs[1].title).toBe('High bug');
        expect(bugs[2].title).toBe('Low bug');
    });

    it('listBugs with priority filter', () => {
        reportBug(db, { title: 'High one', priority: 'high', reported_by: testAgent.id });
        reportBug(db, { title: 'Low one', priority: 'low', reported_by: testAgent.id });

        const highs = listBugs(db, { priority: 'high' });
        expect(highs).toHaveLength(1);
        expect(highs[0].title).toBe('High one');
    });

    it('listBugs with status filter', () => {
        const bug = reportBug(db, { title: 'Bug A', reported_by: testAgent.id });
        reportBug(db, { title: 'Bug B', reported_by: testAgent.id });
        updateBug(db, bug.id, { status: 'investigating' });

        const investigating = listBugs(db, { status: 'investigating' });
        expect(investigating).toHaveLength(1);
        expect(investigating[0].title).toBe('Bug A');
    });

    it('listBugs with blocking filter', () => {
        reportBug(db, { title: 'Blocker', blocking: true, reported_by: testAgent.id });
        reportBug(db, { title: 'Non-blocker', reported_by: testAgent.id });

        const blockers = listBugs(db, { blocking: true });
        expect(blockers).toHaveLength(1);
        expect(blockers[0].title).toBe('Blocker');
    });

    // --- getBugById ---

    it('getBugById returns bug when found', () => {
        const created = reportBug(db, { title: 'Find me', reported_by: testAgent.id });

        const found = getBugById(db, created.id);
        expect(found).toBeDefined();
        expect(found!.title).toBe('Find me');
    });

    it('getBugById returns undefined when not found', () => {
        const found = getBugById(db, 'nonexistent-uuid');
        expect(found).toBeUndefined();
    });

    // --- getBugContent ---

    it('getBugContent reads from filesystem', () => {
        // Set up template
        const tplDir = path.join(tempDir, 'docs', 'templates');
        fs.mkdirSync(tplDir, { recursive: true });
        fs.writeFileSync(
            path.join(tplDir, 'BUG.md'),
            '# {Title}\n\nPriority: {Priority}\n',
        );

        const bug = reportBug(db, {
            title: 'Read me',
            reported_by: testAgent.id,
            projectRoot: tempDir,
        });

        const content = getBugContent(db, bug.id, tempDir);
        expect(content).not.toBeNull();
        expect(content).toContain('Read me');
    });

    // --- updateBug ---

    it('updateBug updates title and description', () => {
        const bug = reportBug(db, { title: 'Old title', reported_by: testAgent.id });
        const updated = updateBug(db, bug.id, {
            title: 'New title',
            description: 'Added description',
        });

        expect(updated.title).toBe('New title');
        expect(updated.description).toBe('Added description');
    });

    it('updateBug sets resolved_at when status changes to resolved', () => {
        const bug = reportBug(db, { title: 'Fix me', reported_by: testAgent.id });
        const updated = updateBug(db, bug.id, { status: 'resolved' });

        expect(updated.status).toBe('resolved');
        expect(updated.resolved_at).not.toBeNull();
    });

    it('updateBug sets resolved_at when status changes to closed', () => {
        const bug = reportBug(db, { title: 'Close me', reported_by: testAgent.id });
        const updated = updateBug(db, bug.id, { status: 'closed' });

        expect(updated.status).toBe('closed');
        expect(updated.resolved_at).not.toBeNull();
    });

    it('updateBug throws if bug not found', () => {
        expect(() => {
            updateBug(db, 'nonexistent-uuid', { title: 'Nope' });
        }).toThrow("Bug 'nonexistent-uuid' not found.");
    });

    // --- getBlockingBugs ---

    it('getBlockingBugs returns only open blocking bugs', () => {
        reportBug(db, { title: 'Blocker open', blocking: true, reported_by: testAgent.id });
        reportBug(db, { title: 'Non-blocker', reported_by: testAgent.id });
        const resolved = reportBug(db, { title: 'Blocker resolved', blocking: true, reported_by: testAgent.id });
        updateBug(db, resolved.id, { status: 'resolved' });

        const blockers = getBlockingBugs(db);
        expect(blockers).toHaveLength(1);
        expect(blockers[0].title).toBe('Blocker open');
    });

    it('getBlockingBugs scoped to milestone', () => {
        reportBug(db, {
            title: 'Scoped blocker',
            blocking: true,
            milestone_id: milestoneId,
            reported_by: testAgent.id,
        });
        reportBug(db, {
            title: 'Unscoped blocker',
            blocking: true,
            reported_by: testAgent.id,
        });

        const scoped = getBlockingBugs(db, milestoneId);
        expect(scoped).toHaveLength(1);
        expect(scoped[0].title).toBe('Scoped blocker');
    });
});
