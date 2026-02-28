import { Router } from 'express';
import type Database from 'better-sqlite3';
import type { Task } from '../../db/types.js';

/**
 * Create Express Router with status overview endpoint.
 * This is the one route that uses direct SQL — it's an aggregation
 * endpoint not covered by existing core functions.
 */
export function createStatusRoutes(db: Database.Database): Router {
    const router = Router();

    // GET /api/status — project overview stats
    router.get('/api/status', (_req, res) => {
        try {
            const taskTotal = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any).count;
            const taskByStatus = {
                todo: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = ?").get('todo') as any).count,
                in_progress: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = ?").get('in-progress') as any).count,
                done: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = ?").get('done') as any).count,
                blocked: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = ?").get('blocked') as any).count,
            };
            const taskByPriority = {
                low: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE priority = ?").get('low') as any).count,
                medium: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE priority = ?").get('medium') as any).count,
                high: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE priority = ?").get('high') as any).count,
                urgent: (db.prepare("SELECT COUNT(*) as count FROM tasks WHERE priority = ?").get('urgent') as any).count,
            };

            const agentTotal = (db.prepare('SELECT COUNT(*) as count FROM agents').get() as any).count;
            const agentByType = {
                human: (db.prepare("SELECT COUNT(*) as count FROM agents WHERE type = ?").get('human') as any).count,
                ai: (db.prepare("SELECT COUNT(*) as count FROM agents WHERE type = ?").get('ai') as any).count,
            };

            const contextTotal = (db.prepare('SELECT COUNT(*) as count FROM context').get() as any).count;

            const recentTasks = db.prepare(
                'SELECT * FROM tasks ORDER BY updated_at DESC LIMIT 5'
            ).all() as Task[];

            res.json({
                tasks: {
                    total: taskTotal,
                    by_status: taskByStatus,
                    by_priority: taskByPriority,
                },
                agents: {
                    total: agentTotal,
                    by_type: agentByType,
                },
                context: {
                    total: contextTotal,
                },
                recent_tasks: recentTasks,
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
