import { Router } from 'express';
import type Database from 'better-sqlite3';
import type { Plan } from '../../db/types.js';

/**
 * Create Express Router with status overview endpoint.
 * Aggregates plans, agents, and context — no direct task tables.
 */
export function createStatusRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/status — project overview stats
    router.get('/api/status', (_req, res) => {
        try {
            const planTotal = (db.prepare('SELECT COUNT(*) as count FROM plans').get() as any).count;
            const planByStatus = {
                pending: (db.prepare("SELECT COUNT(*) as count FROM plans WHERE status = ?").get('pending') as any).count,
                in_progress: (db.prepare("SELECT COUNT(*) as count FROM plans WHERE status = ?").get('in_progress') as any).count,
                completed: (db.prepare("SELECT COUNT(*) as count FROM plans WHERE status = ?").get('completed') as any).count,
                failed: (db.prepare("SELECT COUNT(*) as count FROM plans WHERE status = ?").get('failed') as any).count,
            };

            const agentTotal = (db.prepare('SELECT COUNT(*) as count FROM agents').get() as any).count;
            const agentByType = {
                human: (db.prepare("SELECT COUNT(*) as count FROM agents WHERE type = ?").get('human') as any).count,
                ai: (db.prepare("SELECT COUNT(*) as count FROM agents WHERE type = ?").get('ai') as any).count,
            };

            const contextTotal = (db.prepare('SELECT COUNT(*) as count FROM context').get() as any).count;

            const recentPlans = db.prepare(
                'SELECT * FROM plans ORDER BY created_at DESC LIMIT 5'
            ).all() as Plan[];

            res.json({
                plans: {
                    total: planTotal,
                    by_status: planByStatus,
                },
                agents: {
                    total: agentTotal,
                    by_type: agentByType,
                },
                context: {
                    total: contextTotal,
                },
                recent_plans: recentPlans,
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
