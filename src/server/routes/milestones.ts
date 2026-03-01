import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listMilestones, getMilestoneById, getActiveMilestone } from '../../core/milestone.js';
import { listPhases } from '../../core/phase.js';

/**
 * Create Express Router with milestone API endpoints.
 */
export function createMilestoneRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/milestones — list all milestones, optional ?status= filter
    router.get('/api/milestones', (req, res) => {
        try {
            const status = req.query.status as string | undefined;
            const milestones = listMilestones(db, status ? { status } : undefined);
            res.json({ milestones });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // GET /api/milestones/active — get active milestone with phase summary
    router.get('/api/milestones/active', (_req, res) => {
        try {
            const milestone = getActiveMilestone(db);
            if (!milestone) {
                res.status(404).json({ error: 'No active milestone found' });
                return;
            }
            const phases = listPhases(db, milestone.id);
            const phases_summary = {
                total: phases.length,
                completed: phases.filter(p => p.status === 'completed').length,
                in_progress: phases.filter(p => p.status === 'in_progress').length,
                not_started: phases.filter(p => p.status === 'not_started').length,
            };
            res.json({ milestone, phases_summary });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/milestones/:id — get single milestone by ID with phase count
    router.get('/api/milestones/:id', (req, res) => {
        try {
            const milestone = getMilestoneById(db, req.params.id);
            if (!milestone) {
                res.status(404).json({ error: `Milestone '${req.params.id}' not found` });
                return;
            }
            const phases = listPhases(db, milestone.id);
            res.json({ milestone, phases_total: phases.length });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}
