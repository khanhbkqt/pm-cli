import { describe, it, expect, afterEach } from 'vitest';
import net from 'net';
import Database from 'better-sqlite3';
import { getAvailablePort } from '../src/server/utils.js';
import { createApp } from '../src/server/app.js';

describe('getAvailablePort', () => {
    it('returns default port (4000) when available', async () => {
        const port = await getAvailablePort(4000);
        expect(port).toBe(4000);
    });

    it('returns alternative port when preferred port is busy', async () => {
        // Occupy port 4001
        const blocker = net.createServer();
        await new Promise<void>((resolve) => blocker.listen(4001, resolve));

        try {
            const port = await getAvailablePort(4001);
            expect(port).not.toBe(4001);
            expect(port).toBeGreaterThan(0);
        } finally {
            await new Promise<void>((resolve) => blocker.close(() => resolve()));
        }
    });
});

describe('createApp', () => {
    let db: Database.Database;
    let server: ReturnType<typeof import('net').createServer> | null = null;

    afterEach(async () => {
        if (server) {
            await new Promise<void>((resolve) =>
                (server as any).close(() => resolve())
            );
            server = null;
        }
        if (db) {
            db.close();
        }
    });

    it('returns an Express app with listen function', () => {
        db = new Database(':memory:');
        const app = createApp(db);
        expect(typeof app.listen).toBe('function');
    });

    it('responds to GET /api/health with { status: "ok" }', async () => {
        db = new Database(':memory:');
        const app = createApp(db);
        const port = await getAvailablePort(4050);

        server = app.listen(port);

        const res = await fetch(`http://localhost:${port}/api/health`);
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body).toEqual({ status: 'ok' });
    });
});
