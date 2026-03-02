import { Command } from 'commander';
import { handleCommandError } from '../../cli/error.js';
import { getProjectDb, findProjectRoot } from '../../core/identity.js';
import { createApp, getAvailablePort, openBrowser } from '../../server/index.js';

/**
 * Register the `pm dashboard` command.
 * Starts Express server, opens browser, handles graceful shutdown.
 */
export function registerDashboardCommand(program: Command): void {
    program
        .command('dashboard')
        .description('Launch project dashboard in browser')
        .option('--port <number>', 'Preferred port', '4000')
        .option('--no-open', "Don't auto-open browser")
        .action(async (opts) => {
            try {
                const projectRoot = findProjectRoot();
                const db = getProjectDb(projectRoot);
                const app = createApp(db, projectRoot);
                const preferredPort = parseInt(opts.port, 10);
                const resolvedPort = await getAvailablePort(preferredPort);
                const url = `http://localhost:${resolvedPort}`;

                const server = app.listen(resolvedPort, () => {
                    console.log(`🚀 Dashboard running at ${url}`);
                    console.log('Press Ctrl+C to stop');
                });

                if (opts.open !== false) {
                    openBrowser(url);
                }

                // Graceful shutdown
                const shutdown = () => {
                    console.log('\nShutting down dashboard...');
                    server.close(() => {
                        db.close();
                        process.exit(0);
                    });
                };

                process.on('SIGINT', shutdown);
                process.on('SIGTERM', shutdown);
            } catch (error) {
                handleCommandError(error);
            }
        });
}
