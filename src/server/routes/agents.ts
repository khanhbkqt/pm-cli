import { Router } from 'express';
import type Database from 'better-sqlite3';
import { listAgents, getAgentById } from '../../core/agent.js';

/**
 * Create Express Router with agent API endpoints.
 */
export function createAgentRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/agents — list all agents
    router.get('/api/agents', (_req, res) => {
        try {
            const agents = listAgents(db);
            res.json({ agents });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    // GET /api/agents/:id — get agent by ID
    router.get('/api/agents/:id', (req, res) => {
        try {
            const agent = getAgentById(db, req.params.id);
            if (!agent) {
                res.status(404).json({ error: `Agent '${req.params.id}' not found` });
                return;
            }
            res.json({ agent });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    });

    return router;
}
