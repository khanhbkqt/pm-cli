import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listPlans, getPlanById } from '../../core/plan.js';

/**
 * Create Express Router with plan API endpoints.
 */
export function createPlanRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/phases/:phaseId/plans — list plans for a phase
    router.get('/api/phases/:phaseId/plans', (req, res) => {
        try {
            const phaseId = parseInt(req.params.phaseId, 10);
            if (isNaN(phaseId)) {
                res.status(400).json({ error: 'Phase ID must be a number' });
                return;
            }
            const status = req.query.status as string | undefined;
            const waveStr = req.query.wave as string | undefined;
            const wave = waveStr ? parseInt(waveStr, 10) : undefined;

            const filters: { status?: string; wave?: number } = {};
            if (status) filters.status = status;
            if (wave !== undefined && !isNaN(wave)) filters.wave = wave;

            const plans = listPlans(db, phaseId, Object.keys(filters).length > 0 ? filters : undefined);
            res.json({ plans });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // GET /api/plans/:id — get single plan by ID
    router.get('/api/plans/:id', (req, res) => {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Plan ID must be a number' });
                return;
            }
            const plan = getPlanById(db, id);
            if (!plan) {
                res.status(404).json({ error: `Plan #${id} not found` });
                return;
            }
            res.json({ plan });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}
