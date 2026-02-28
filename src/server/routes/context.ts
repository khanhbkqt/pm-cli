import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listContext, searchContext } from '../../core/context.js';

/**
 * Create Express Router with context API endpoints.
 */
export function createContextRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/context — list context entries with optional category filter
    router.get('/api/context', (req, res) => {
        try {
            const filters: { category?: string } = {};
            if (typeof req.query.category === 'string') filters.category = req.query.category;

            const entries = listContext(db, filters);
            res.json({ entries });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // GET /api/context/search — search context entries
    router.get('/api/context/search', (req, res) => {
        const q = req.query.q;
        if (typeof q !== 'string' || !q) {
            res.status(400).json({ error: 'Missing required query parameter: q' });
            return;
        }

        try {
            const entries = searchContext(db, q);
            res.json({ entries });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}
