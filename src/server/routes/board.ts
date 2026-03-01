import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listMilestones } from '../../core/milestone.js';
import { listPhases } from '../../core/phase.js';
import { listPlans } from '../../core/plan.js';

/**
 * Create Express Router with board API endpoint.
 * Returns the full project hierarchy: Milestones → Phases → Plans.
 */
export function createBoardRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/board — full hierarchy for the board view
    router.get('/api/board', (_req, res) => {
        try {
            const milestones = listMilestones(db);
            const board = milestones.map(m => {
                const phases = listPhases(db, m.id);
                const phasesWithPlans = phases.map(p => ({
                    ...p,
                    plans: listPlans(db, p.id),
                }));
                return { ...m, phases: phasesWithPlans };
            });
            res.json({ board });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
