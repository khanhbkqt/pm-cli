import { Router } from 'express';
import type Database from 'better-sqlite3';
import { reportBug, listBugs, getBugById, getBugContent, updateBug } from '../../core/bug.js';

/**
 * Create Express Router with bug API endpoints.
 * `projectRoot` is used to resolve bug content files from the filesystem.
 */
export function createBugRoutes(db: Database.Database, projectRoot: string): Router {
    const router = Router();

    // GET /api/bugs — list bugs with optional filters
    router.get('/api/bugs', (req, res) => {
        try {
            const priority = req.query.priority as string | undefined;
            const status = req.query.status as string | undefined;
            const blockingStr = req.query.blocking as string | undefined;
            const milestone_id = req.query.milestone_id as string | undefined;

            const filters: {
                priority?: any;
                status?: any;
                blocking?: boolean;
                milestone_id?: string;
            } = {};
            if (priority) filters.priority = priority;
            if (status) filters.status = status;
            if (blockingStr !== undefined) filters.blocking = blockingStr === 'true' || blockingStr === '1';
            if (milestone_id) filters.milestone_id = milestone_id;

            const bugs = listBugs(db, Object.keys(filters).length > 0 ? filters : undefined);
            res.json({ bugs });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // POST /api/bugs — report a new bug
    router.post('/api/bugs', (req, res) => {
        try {
            const { title, description, priority, reported_by, milestone_id, phase_id, blocking } = req.body;
            if (!title) {
                res.status(400).json({ error: 'title is required' });
                return;
            }
            if (!reported_by) {
                res.status(400).json({ error: 'reported_by is required' });
                return;
            }
            const bug = reportBug(db, {
                title,
                description,
                priority,
                reported_by,
                milestone_id,
                phase_id,
                blocking,
                projectRoot,
            });
            res.status(201).json({ bug });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // GET /api/bugs/:id — get bug detail + filesystem content
    router.get('/api/bugs/:id', (req, res) => {
        try {
            const bug = getBugById(db, req.params.id);
            if (!bug) {
                res.status(404).json({ error: `Bug '${req.params.id}' not found` });
                return;
            }
            const content = getBugContent(db, req.params.id, projectRoot);
            res.json({ bug: { ...bug, content } });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // PATCH /api/bugs/:id — update bug fields
    router.patch('/api/bugs/:id', (req, res) => {
        try {
            const { status, priority, assigned_to, blocking, description } = req.body;
            const bug = updateBug(db, req.params.id, {
                status,
                priority,
                assigned_to,
                blocking,
                description,
                projectRoot,
            });
            res.json({ bug });
        } catch (err: any) {
            if (err.message.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(400).json({ error: err.message });
            }
        }
    });

    return router;
}
