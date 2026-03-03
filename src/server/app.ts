import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type Database from 'better-sqlite3';
import { createAgentRoutes, createContextRoutes, createStatusRoutes, createMilestoneRoutes, createPhaseRoutes, createPlanRoutes, createBoardRoutes, createBugRoutes } from './routes/index.js';
import { createProgressRouter } from './routes/progress.js';

/**
 * Create an Express app for the dashboard.
 * Accepts a database connection and project root for API routes and static file serving.
 */
export function createApp(db: Database.Database, projectRoot: string): express.Express {
    const app = express();
    app.use(express.json());

    // Health check endpoint
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    // API routes

    app.use(createAgentRoutes(db));
    app.use(createContextRoutes(db));
    app.use(createStatusRoutes(db));
    app.use(createProgressRouter(db));
    app.use(createMilestoneRoutes(db));
    app.use(createPhaseRoutes(db));
    app.use(createPlanRoutes(db, projectRoot));
    app.use(createBoardRoutes(db));
    app.use(createBugRoutes(db, projectRoot));

    // Serve static dashboard files if the directory exists
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dashboardPath = path.join(__dirname, 'dashboard');
    if (fs.existsSync(dashboardPath)) {
        app.use(express.static(dashboardPath));
        app.get('{*path}', (req, res) => {
            if (!req.path.startsWith('/api')) {
                res.sendFile(path.join(dashboardPath, 'index.html'));
            }
        });
    }

    return app;
}
