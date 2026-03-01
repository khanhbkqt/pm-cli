import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getActiveMilestone } from '../../core/milestone.js';
import { listPhases } from '../../core/phase.js';
import { listPlans } from '../../core/plan.js';

/**
 * Create Express Router with progress endpoint.
 * GET /api/progress — returns active milestone progress with phase/plan stats.
 */
export function createProgressRouter(db: Database.Database): Router {
    const router = Router();

    router.get('/api/progress', (_req, res) => {
        try {
            const milestone = getActiveMilestone(db);
            if (!milestone) {
                res.status(404).json({ error: 'No active milestone' });
                return;
            }

            const phases = listPhases(db, milestone.id);
            const enrichedPhases = phases.map(phase => {
                const plans = listPlans(db, phase.id);
                return {
                    ...phase,
                    plans_total: plans.length,
                    plans_done: plans.filter(p => p.status === 'completed').length,
                    plans_failed: plans.filter(p => p.status === 'failed').length,
                };
            });

            const phases_total = phases.length;
            const phases_complete = phases.filter(p => p.status === 'completed').length;
            const phases_pct = phases_total > 0 ? Math.round((phases_complete / phases_total) * 100) : 0;

            res.json({
                milestone,
                phases: enrichedPhases,
                summary: { phases_total, phases_complete, phases_pct },
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
