import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listPhases, getPhaseById } from '../../core/phase.js';
import { listPlans } from '../../core/plan.js';

/**
 * Create Express Router with phase API endpoints.
 */
export function createPhaseRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/milestones/:milestoneId/phases — list phases for a milestone
    router.get('/api/milestones/:milestoneId/phases', (req, res) => {
        try {
            const status = req.query.status as string | undefined;
            const phases = listPhases(db, req.params.milestoneId, status ? { status } : undefined);

            // Enrich each phase with plan counts
            const enriched = phases.map(phase => {
                const plans = listPlans(db, phase.id);
                return {
                    ...phase,
                    plans_total: plans.length,
                    plans_done: plans.filter(p => p.status === 'completed').length,
                };
            });

            res.json({ phases: enriched });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // GET /api/phases/:id — get single phase by ID with plans
    router.get('/api/phases/:id', (req, res) => {
        try {
            const phase = getPhaseById(db, req.params.id);
            if (!phase) {
                res.status(404).json({ error: `Phase '${req.params.id}' not found` });
                return;
            }
            const plans = listPlans(db, phase.id);
            res.json({ phase, plans });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}
