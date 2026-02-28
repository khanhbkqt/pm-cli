import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listTasks, addTask, getTaskById, updateTask, assignTask, addComment, getComments } from '../../core/task.js';

/**
 * Create Express Router with task API endpoints.
 */
export function createTaskRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/tasks — list tasks with optional filters
    router.get('/api/tasks', (req, res) => {
        try {
            const filters: { status?: string; assigned_to?: string } = {};
            if (typeof req.query.status === 'string') filters.status = req.query.status;
            if (typeof req.query.assigned_to === 'string') filters.assigned_to = req.query.assigned_to;

            const tasks = listTasks(db, filters);
            res.json({ tasks });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // POST /api/tasks — create a new task
    router.post('/api/tasks', (req, res) => {
        try {
            const task = addTask(db, req.body);
            res.status(201).json({ task });
        } catch (err: any) {
            if (err.message?.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(400).json({ error: err.message });
            }
        }
    });

    // GET /api/tasks/:id — get a single task
    router.get('/api/tasks/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        try {
            const task = getTaskById(db, id);
            if (!task) {
                res.status(404).json({ error: `Task #${id} not found` });
                return;
            }
            res.json({ task });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // PUT /api/tasks/:id — update a task
    router.put('/api/tasks/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        try {
            const task = updateTask(db, id, req.body);
            res.json({ task });
        } catch (err: any) {
            if (err.message?.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(400).json({ error: err.message });
            }
        }
    });

    // POST /api/tasks/:id/assign — assign agent to task
    router.post('/api/tasks/:id/assign', (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        try {
            const task = assignTask(db, id, req.body.agent_id);
            res.json({ task });
        } catch (err: any) {
            if (err.message?.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(400).json({ error: err.message });
            }
        }
    });

    // POST /api/tasks/:id/comments — add a comment
    router.post('/api/tasks/:id/comments', (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        try {
            const comment = addComment(db, {
                task_id: id,
                agent_id: req.body.agent_id,
                content: req.body.content,
            });
            res.status(201).json({ comment });
        } catch (err: any) {
            if (err.message?.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(400).json({ error: err.message });
            }
        }
    });

    // GET /api/tasks/:id/comments — list comments for a task
    router.get('/api/tasks/:id/comments', (req, res) => {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }

        try {
            const comments = getComments(db, id);
            res.json({ comments });
        } catch (err: any) {
            if (err.message?.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(400).json({ error: err.message });
            }
        }
    });

    return router;
}
