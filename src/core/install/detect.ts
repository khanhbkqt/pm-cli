import * as fs from 'fs';
import * as path from 'path';
import type { ClientType, DetectionResult } from './types.js';

/** Signature files/directories used to identify each client. */
interface ClientSignature {
    client: ClientType;
    checks: Array<{
        path: string;
        type: 'file' | 'directory';
        confidence: 'high' | 'medium' | 'low';
        reason: string;
    }>;
}

const CLIENT_SIGNATURES: ClientSignature[] = [
    {
        client: 'antigravity',
        checks: [
            { path: '.agent', type: 'directory', confidence: 'high', reason: 'Found .agent/ directory' },
            { path: '.gemini', type: 'directory', confidence: 'high', reason: 'Found .gemini/ directory' },
        ],
    },
    {
        client: 'claude-code',
        checks: [
            { path: 'CLAUDE.md', type: 'file', confidence: 'high', reason: 'Found CLAUDE.md file' },
            { path: '.claude', type: 'directory', confidence: 'medium', reason: 'Found .claude/ directory' },
        ],
    },
    {
        client: 'cursor',
        checks: [
            { path: '.cursor', type: 'directory', confidence: 'high', reason: 'Found .cursor/ directory' },
            { path: '.cursorignore', type: 'file', confidence: 'medium', reason: 'Found .cursorignore file' },
        ],
    },
    {
        client: 'codex',
        checks: [
            { path: 'AGENTS.md', type: 'file', confidence: 'medium', reason: 'Found AGENTS.md file' },
        ],
    },
    {
        client: 'opencode',
        checks: [
            { path: 'opencode.json', type: 'file', confidence: 'high', reason: 'Found opencode.json file' },
            { path: 'AGENTS.md', type: 'file', confidence: 'low', reason: 'Found AGENTS.md without opencode.json' },
        ],
    },
    {
        client: 'gemini-cli',
        checks: [
            { path: 'GEMINI.md', type: 'file', confidence: 'high', reason: 'Found GEMINI.md file' },
            { path: '.gemini', type: 'directory', confidence: 'medium', reason: 'Found .gemini/ directory' },
        ],
    },
];

/** Confidence priority for sorting results. */
const CONFIDENCE_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/**
 * Check if a path exists as the expected type (file or directory).
 */
function pathExists(fullPath: string, type: 'file' | 'directory'): boolean {
    try {
        const stat = fs.statSync(fullPath);
        return type === 'directory' ? stat.isDirectory() : stat.isFile();
    } catch {
        return false;
    }
}

/**
 * Detect all AI coding clients present in the given project root.
 *
 * Returns results sorted by confidence (high first).
 */
export function detectClients(projectRoot: string): DetectionResult[] {
    const results: DetectionResult[] = [];

    for (const sig of CLIENT_SIGNATURES) {
        // For OpenCode, the low-confidence AGENTS.md check should only match
        // when opencode.json is NOT present (already covered by codex).
        const hasHighConfidence = sig.checks.some(
            (check) =>
                check.confidence === 'high' &&
                pathExists(path.join(projectRoot, check.path), check.type)
        );

        for (const check of sig.checks) {
            const fullPath = path.join(projectRoot, check.path);

            // Skip OpenCode's low-confidence fallback if we found a high-confidence match
            if (sig.client === 'opencode' && check.confidence === 'low' && hasHighConfidence) {
                continue;
            }

            if (pathExists(fullPath, check.type)) {
                results.push({
                    client: sig.client,
                    confidence: check.confidence,
                    reason: check.reason,
                });
                break; // Take the first (highest-confidence) match per client
            }
        }
    }

    // Sort by confidence: high → medium → low
    results.sort((a, b) => CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence]);

    return results;
}

/**
 * Detect a single specific client in the given project root.
 *
 * Returns the detection result if found, or null if not present.
 */
export function detectClient(projectRoot: string, client: ClientType): DetectionResult | null {
    const all = detectClients(projectRoot);
    return all.find((r) => r.client === client) ?? null;
}
