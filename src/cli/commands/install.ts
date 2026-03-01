import { Command } from 'commander';
import type { ClientType, GenerateResult, DetectionResult } from '../../core/install/types.js';
import { getAdapter, getAllAdapters } from '../../core/install/registry.js';
import { getTemplatePath } from '../../core/install/template.js';
import { detectClients } from '../../core/install/detect.js';

// Import adapters to trigger registration
import '../../core/install/adapters/antigravity.js';
import '../../core/install/adapters/claude-code.js';
import '../../core/install/adapters/cursor.js';
import '../../core/install/adapters/codex.js';
import '../../core/install/adapters/opencode.js';
import '../../core/install/adapters/gemini-cli.js';

/** All valid client type values. */
const VALID_CLIENTS: ClientType[] = ['antigravity', 'claude-code', 'cursor', 'codex', 'opencode', 'gemini-cli'];

/**
 * Install config for a single client.
 */
function installForClient(
    client: ClientType,
    projectRoot: string,
    force: boolean,
): GenerateResult {
    const adapter = getAdapter(client);
    const templatePath = getTemplatePath(projectRoot);
    return adapter.generate(projectRoot, templatePath);
}

/**
 * Install config for all detected (or all available) clients.
 */
function installForAll(
    projectRoot: string,
    force: boolean,
): { client: ClientType; result: GenerateResult }[] {
    const detected = detectClients(projectRoot);
    const results: { client: ClientType; result: GenerateResult }[] = [];

    // If clients are detected, only install for those
    // If none detected, install for all
    const clientsToInstall: ClientType[] =
        detected.length > 0
            ? [...new Set(detected.map((d) => d.client))]
            : VALID_CLIENTS;

    for (const client of clientsToInstall) {
        const result = installForClient(client, projectRoot, force);
        results.push({ client, result });
    }

    return results;
}

/**
 * Register the `pm install` command.
 */
export function registerInstallCommand(program: Command): void {
    const installCmd = program
        .command('install [client]')
        .description('Install AI agent config for a specific client or all detected clients')
        .option('--all', 'Install for all detected clients')
        .option('--detect', 'Detect AI clients present in the project (no changes)')
        .option('--force', 'Overwrite existing files without section merging')
        .action(async (clientArg?: string) => {
            try {
                const json = program.opts().json;
                const opts = installCmd.opts();
                const projectRoot = process.cwd();

                // --- Mode: Detect only ---
                if (opts.detect) {
                    handleDetect(projectRoot, json);
                    return;
                }

                // --- Mode: Install all ---
                if (opts.all) {
                    handleInstallAll(projectRoot, opts.force ?? false, json);
                    return;
                }

                // --- Mode: Install specific client ---
                if (!clientArg) {
                    console.error(
                        'Error: specify a client name or use --all / --detect.\n' +
                        `Valid clients: ${VALID_CLIENTS.join(', ')}`,
                    );
                    process.exit(1);
                }

                if (!VALID_CLIENTS.includes(clientArg as ClientType)) {
                    console.error(
                        `Error: unknown client '${clientArg}'.\n` +
                        `Valid clients: ${VALID_CLIENTS.join(', ')}`,
                    );
                    process.exit(1);
                }

                handleInstallClient(clientArg as ClientType, projectRoot, opts.force ?? false, json);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error: ${error.message}`);
                } else {
                    console.error('An unexpected error occurred');
                }
                process.exit(1);
            }
        });
}

// ── Handlers ──────────────────────────────────────────────────────────────

function handleDetect(projectRoot: string, json: boolean): void {
    const results = detectClients(projectRoot);

    if (json) {
        console.log(JSON.stringify({ detected: results }, null, 2));
        return;
    }

    if (results.length === 0) {
        console.log('🔍 No AI coding clients detected in this project.');
        console.log('   Run `pm install <client>` to install for a specific client.');
        return;
    }

    console.log('🔍 Detected AI Clients');
    console.log('──────────────────────');
    for (const r of results) {
        const badge =
            r.confidence === 'high' ? '🟢' : r.confidence === 'medium' ? '🟡' : '🔴';
        console.log(`  ${badge} ${r.client} (${r.confidence}) — ${r.reason}`);
    }
}

function handleInstallClient(
    client: ClientType,
    projectRoot: string,
    force: boolean,
    json: boolean,
): void {
    const result = installForClient(client, projectRoot, force);

    if (json) {
        console.log(
            JSON.stringify(
                {
                    client,
                    files: result.files,
                    warnings: result.warnings,
                },
                null,
                2,
            ),
        );
        return;
    }

    console.log(`✅ Installed PM config for ${client}`);
    for (const f of result.files) {
        console.log(`   📄 ${f}`);
    }
    for (const w of result.warnings) {
        console.log(`   ⚠️  ${w}`);
    }
}

function handleInstallAll(projectRoot: string, force: boolean, json: boolean): void {
    const results = installForAll(projectRoot, force);

    if (json) {
        console.log(
            JSON.stringify(
                {
                    installed: results.map((r) => ({
                        client: r.client,
                        files: r.result.files,
                        warnings: r.result.warnings,
                    })),
                },
                null,
                2,
            ),
        );
        return;
    }

    console.log('✅ Installed PM config for detected clients');
    console.log('──────────────────────────────────────────');
    for (const { client, result } of results) {
        console.log(`\n  📦 ${client}`);
        for (const f of result.files) {
            console.log(`     📄 ${f}`);
        }
        for (const w of result.warnings) {
            console.log(`     ⚠️  ${w}`);
        }
    }
}
