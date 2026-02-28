import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Default relative path from project root to the canonical template. */
const TEMPLATE_RELATIVE_PATH = 'docs/agent-guide/AGENT_INSTRUCTIONS.md';

/**
 * Resolve the absolute path to the canonical AGENT_INSTRUCTIONS.md template.
 *
 * Lookup order:
 * 1. Relative to the given project root (development / source checkout)
 * 2. Relative to the package install location (npm global install)
 */
export function getTemplatePath(projectRoot?: string): string {
    // Try project root first (for development or monorepo usage)
    if (projectRoot) {
        const fromRoot = path.resolve(projectRoot, TEMPLATE_RELATIVE_PATH);
        if (fs.existsSync(fromRoot)) {
            return fromRoot;
        }
    }

    // Fallback: relative to this package's install location
    // src/core/install/template.ts → ../../.. → package root
    const packageRoot = path.resolve(__dirname, '..', '..', '..');
    const fromPackage = path.join(packageRoot, TEMPLATE_RELATIVE_PATH);
    if (fs.existsSync(fromPackage)) {
        return fromPackage;
    }

    throw new Error(
        `Cannot find canonical template at '${TEMPLATE_RELATIVE_PATH}'. ` +
        'Ensure the pm package is installed correctly.'
    );
}

/**
 * Load the canonical AGENT_INSTRUCTIONS.md template as a raw string.
 *
 * This string is passed to client adapters which transform it into
 * each client's native configuration format.
 */
export function loadCanonicalTemplate(projectRoot?: string): string {
    const templatePath = getTemplatePath(projectRoot);
    return fs.readFileSync(templatePath, 'utf-8');
}
