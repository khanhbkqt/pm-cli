import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from '../src/db/index.js';
import { registerAgent } from '../src/core/agent.js';
import {
    addTask,
    listTasks,
    getTaskById,
    updateTask,
    assignTask,
    addComment,
    getComments,
} from '../src/core/task.js';

describe('task core', () => {
    let tempDir: string;
    let db: ReturnType<typeof getDatabase>;
    let testAgent: { id: string; name: string };

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-task-test-'));
        const dbPath = path.join(tempDir, 'data.db');
        db = getDatabase(dbPath);
        // Register a test agent for task operations
        testAgent = registerAgent(db, { name: 'tester', role: 'developer', type: 'human' });
    });

    afterEach(() => {
        db.close();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // --- addTask ---

    it('addTask creates task with correct default fields', () => {
        const task = addTask(db, { title: 'Test task', created_by: testAgent.id });

        expect(task.title).toBe('Test task');
        expect(task.status).toBe('todo');
        expect(task.priority).toBe('medium');
        expect(task.created_by).toBe(testAgent.id);
        expect(task.assigned_to).toBeNull();
        expect(task.parent_id).toBeNull();
        expect(task.description).toBeNull();
        expect(task.id).toBeDefined();
        expect(task.created_at).toBeDefined();
    });

    it('addTask with all optional fields', () => {
        const task = addTask(db, {
            title: 'Full task',
            description: 'A detailed description',
            priority: 'high',
            created_by: testAgent.id,
        });

        expect(task.description).toBe('A detailed description');
        expect(task.priority).toBe('high');
    });

    it('addTask throws if created_by agent does not exist', () => {
        expect(() => {
            addTask(db, { title: 'Bad task', created_by: 'nonexistent-id' });
        }).toThrow("Creator agent 'nonexistent-id' not found.");
    });

    it('addTask throws if parent_id task does not exist', () => {
        expect(() => {
            addTask(db, { title: 'Orphan subtask', parent_id: 999, created_by: testAgent.id });
        }).toThrow('Task #999 not found.');
    });

    it('addTask with parent_id links to parent (subtask)', () => {
        const parent = addTask(db, { title: 'Parent', created_by: testAgent.id });
        const child = addTask(db, { title: 'Child', parent_id: parent.id, created_by: testAgent.id });

        expect(child.parent_id).toBe(parent.id);
    });

    // --- listTasks ---

    it('listTasks returns all tasks sorted by created_at DESC', () => {
        addTask(db, { title: 'First', created_by: testAgent.id });
        addTask(db, { title: 'Second', created_by: testAgent.id });

        const tasks = listTasks(db);

        expect(tasks).toHaveLength(2);
        const titles = tasks.map(t => t.title);
        expect(titles).toContain('First');
        expect(titles).toContain('Second');
    });

    it('listTasks with status filter returns only matching tasks', () => {
        addTask(db, { title: 'Todo task', created_by: testAgent.id });
        const doneTask = addTask(db, { title: 'Done task', created_by: testAgent.id });
        updateTask(db, doneTask.id, { status: 'done' });

        const todos = listTasks(db, { status: 'todo' });
        expect(todos).toHaveLength(1);
        expect(todos[0].title).toBe('Todo task');
    });

    it('listTasks with assigned_to filter', () => {
        const bob = registerAgent(db, { name: 'bob', role: 'reviewer', type: 'ai' });
        const t1 = addTask(db, { title: 'Unassigned', created_by: testAgent.id });
        const t2 = addTask(db, { title: 'Assigned to bob', created_by: testAgent.id });
        assignTask(db, t2.id, bob.id);

        const assigned = listTasks(db, { assigned_to: bob.id });
        expect(assigned).toHaveLength(1);
        expect(assigned[0].title).toBe('Assigned to bob');
    });

    // --- getTaskById ---

    it('getTaskById returns task when found', () => {
        const created = addTask(db, { title: 'Find me', created_by: testAgent.id });

        const found = getTaskById(db, created.id);
        expect(found).toBeDefined();
        expect(found!.title).toBe('Find me');
    });

    it('getTaskById returns undefined when not found', () => {
        const found = getTaskById(db, 999);
        expect(found).toBeUndefined();
    });

    // --- updateTask ---

    it('updateTask updates title and bumps updated_at', () => {
        const task = addTask(db, { title: 'Original', created_by: testAgent.id });
        const updated = updateTask(db, task.id, { title: 'Updated' });

        expect(updated.title).toBe('Updated');
        expect(updated.id).toBe(task.id);
    });

    it('updateTask updates status', () => {
        const task = addTask(db, { title: 'Task', created_by: testAgent.id });
        const updated = updateTask(db, task.id, { status: 'done' });

        expect(updated.status).toBe('done');
    });

    it('updateTask throws if task does not exist', () => {
        expect(() => {
            updateTask(db, 999, { title: 'Nope' });
        }).toThrow('Task #999 not found.');
    });

    // --- assignTask ---

    it('assignTask sets assigned_to correctly', () => {
        const task = addTask(db, { title: 'Assign me', created_by: testAgent.id });
        const updated = assignTask(db, task.id, testAgent.id);

        expect(updated.assigned_to).toBe(testAgent.id);
    });

    it('assignTask throws if agent does not exist', () => {
        const task = addTask(db, { title: 'Bad assign', created_by: testAgent.id });

        expect(() => {
            assignTask(db, task.id, 'nonexistent-id');
        }).toThrow("Assignee agent 'nonexistent-id' not found.");
    });

    // --- addComment ---

    it('addComment creates comment linked to task', () => {
        const task = addTask(db, { title: 'Commentable', created_by: testAgent.id });
        const comment = addComment(db, {
            task_id: task.id,
            agent_id: testAgent.id,
            content: 'Great work!',
        });

        expect(comment.task_id).toBe(task.id);
        expect(comment.agent_id).toBe(testAgent.id);
        expect(comment.content).toBe('Great work!');
        expect(comment.id).toBeDefined();
    });

    it('addComment throws if task does not exist', () => {
        expect(() => {
            addComment(db, { task_id: 999, agent_id: testAgent.id, content: 'Nope' });
        }).toThrow('Task #999 not found.');
    });

    // --- getComments ---

    it('getComments returns comments in chronological order', () => {
        const task = addTask(db, { title: 'Task', created_by: testAgent.id });
        addComment(db, { task_id: task.id, agent_id: testAgent.id, content: 'First' });
        addComment(db, { task_id: task.id, agent_id: testAgent.id, content: 'Second' });

        const comments = getComments(db, task.id);
        expect(comments).toHaveLength(2);
        expect(comments[0].content).toBe('First');
        expect(comments[1].content).toBe('Second');
    });

    it('getComments returns empty array for task with no comments', () => {
        const task = addTask(db, { title: 'No comments', created_by: testAgent.id });
        const comments = getComments(db, task.id);
        expect(comments).toHaveLength(0);
    });
});
