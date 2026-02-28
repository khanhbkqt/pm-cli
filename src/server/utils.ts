import net from 'net';
import { exec } from 'child_process';

/**
 * Find an available port, starting with the preferred port.
 * Falls back to an OS-assigned port if the preferred port is busy.
 */
export function getAvailablePort(preferred: number = 4000): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(preferred, () => {
            const addr = server.address();
            const port = typeof addr === 'object' && addr ? addr.port : preferred;
            server.close(() => resolve(port));
        });
        server.on('error', () => {
            // Preferred port busy — let OS assign one
            const fallback = net.createServer();
            fallback.listen(0, () => {
                const addr = fallback.address();
                const port = typeof addr === 'object' && addr ? addr.port : 0;
                fallback.close(() => resolve(port));
            });
            fallback.on('error', reject);
        });
    });
}

/**
 * Open a URL in the default browser.
 * Fire-and-forget — errors are silently ignored.
 */
export function openBrowser(url: string): void {
    const cmd =
        process.platform === 'darwin'
            ? 'open'
            : process.platform === 'win32'
                ? 'start'
                : 'xdg-open';
    exec(`${cmd} ${url}`, () => {
        // ignore errors
    });
}
