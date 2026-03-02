import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listPlans, getPlanById, getPlanContent } from '../../core/plan.js';

/**
 * Create Express Router with plan API endpoints.
 * `projectRoot` is used to resolve plan content files from the filesystem.
 */
export function createPlanRoutes(db: Database.Database, projectRoot: string): Router {
    const router = Router();

    // GET /api/phases/:phaseId/plans — list plans for a phase (metadata only, no content)
    router.get('/api/phases/:phaseId/plans', (req, res) => {
        try {
            const status = req.query.status as string | undefined;
            const waveStr = req.query.wave as string | undefined;
            const wave = waveStr ? parseInt(waveStr, 10) : undefined;

            const filters: { status?: string; wave?: number } = {};
            if (status) filters.status = status;
            if (wave !== undefined && !isNaN(wave)) filters.wave = wave;

            const plans = listPlans(db, req.params.phaseId, Object.keys(filters).length > 0 ? filters : undefined);
            res.json({ plans });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // GET /api/plans/:id — get single plan by ID, including content from filesystem
    router.get('/api/plans/:id', (req, res) => {
        try {
            const plan = getPlanById(db, req.params.id);
            if (!plan) {
                res.status(404).json({ error: `Plan '${req.params.id}' not found` });
                return;
            }
            const content = getPlanContent(db, req.params.id, projectRoot);
            res.json({ plan: { ...plan, content } });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}
