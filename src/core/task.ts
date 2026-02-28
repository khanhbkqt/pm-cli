import type Database from 'better-sqlite3';
import type { Task, TaskComment } from '../db/types.js';
import { getAgentById } from './agent.js';

/**
 * Validate that an agent exists by ID. Throws if not found.
 */
function requireAgent(db: Database.Database, agentId: string, label: string): void {
    const agent = getAgentById(db, agentId);
    if (!agent) {
        throw new Error(`${label} agent '${agentId}' not found.`);
    }
}

/**
 * Validate that a task exists by ID. Throws if not found.
 */
function requireTask(db: Database.Database, taskId: number): Task {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as Task | undefined;
    if (!task) {
        throw new Error(`Task #${taskId} not found.`);
    }
    return task;
}

/**
 * Add a new task. Agent identity (created_by) is mandatory.
 */
export function addTask(
    db: Database.Database,
    params: {
        title: string;
        description?: string;
        priority?: string;
        assigned_to?: string;
        parent_id?: number;
        created_by: string;
    }
): Task {
    const { title, description, priority, assigned_to, parent_id, created_by } = params;

    // Validate creator agent exists
    requireAgent(db, created_by, 'Creator');

    // Validate assignee if provided
    if (assigned_to) {
        requireAgent(db, assigned_to, 'Assignee');
    }

    // Validate parent task if provided
    if (parent_id !== undefined && parent_id !== null) {
        requireTask(db, parent_id);
    }

    const result = db.prepare(
        `INSERT INTO tasks (title, description, priority, assigned_to, parent_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
        title,
        description ?? null,
        priority ?? 'medium',
        assigned_to ?? null,
        parent_id ?? null,
        created_by
    );

    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;
}

/**
 * List tasks with optional filters.
 */
export function listTasks(
    db: Database.Database,
    filters?: { status?: string; assigned_to?: string; parent_id?: number }
): Task[] {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters?.status) {
        conditions.push('status = ?');
        values.push(filters.status);
    }
    if (filters?.assigned_to) {
        conditions.push('assigned_to = ?');
        values.push(filters.assigned_to);
    }
    if (filters?.parent_id !== undefined && filters?.parent_id !== null) {
        conditions.push('parent_id = ?');
        values.push(filters.parent_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return db.prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`).all(...values) as Task[];
}

/**
 * Get a single task by ID.
 */
export function getTaskById(db: Database.Database, id: number): Task | undefined {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
}

/**
 * Update task fields. Only non-undefined fields are updated.
 */
export function updateTask(
    db: Database.Database,
    id: number,
    updates: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        assigned_to?: string;
    }
): Task {
    // Validate task exists
    requireTask(db, id);

    // Validate assignee if provided
    if (updates.assigned_to) {
        requireAgent(db, updates.assigned_to, 'Assignee');
    }

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
        setClauses.push('title = ?');
        values.push(updates.title);
    }
    if (updates.description !== undefined) {
        setClauses.push('description = ?');
        values.push(updates.description);
    }
    if (updates.status !== undefined) {
        setClauses.push('status = ?');
        values.push(updates.status);
    }
    if (updates.priority !== undefined) {
        setClauses.push('priority = ?');
        values.push(updates.priority);
    }
    if (updates.assigned_to !== undefined) {
        setClauses.push('assigned_to = ?');
        values.push(updates.assigned_to);
    }

    if (setClauses.length === 0) {
        return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
    }

    // Always bump updated_at
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
}

/**
 * Assign a task to an agent by agent name.
 */
export function assignTask(
    db: Database.Database,
    taskId: number,
    agentId: string
): Task {
    // Validate agent exists
    requireAgent(db, agentId, 'Assignee');

    return updateTask(db, taskId, { assigned_to: agentId });
}

/**
 * Add a comment to a task.
 */
export function addComment(
    db: Database.Database,
    params: { task_id: number; agent_id: string; content: string }
): TaskComment {
    const { task_id, agent_id, content } = params;

    // Validate task exists
    requireTask(db, task_id);

    // Validate agent exists
    requireAgent(db, agent_id, 'Comment author');

    const result = db.prepare(
        'INSERT INTO task_comments (task_id, agent_id, content) VALUES (?, ?, ?)'
    ).run(task_id, agent_id, content);

    return db.prepare('SELECT * FROM task_comments WHERE id = ?').get(result.lastInsertRowid) as TaskComment;
}

/**
 * Get all comments for a task, in chronological order.
 */
export function getComments(db: Database.Database, taskId: number): TaskComment[] {
    // Validate task exists
    requireTask(db, taskId);

    return db.prepare(
        'SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at ASC'
    ).all(taskId) as TaskComment[];
}
