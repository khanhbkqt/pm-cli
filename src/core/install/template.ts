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

    // Fallback 1: we might be in development (src/core/install/template.ts)
    const devPackageRoot = path.resolve(__dirname, '..', '..', '..');
    const devFromPackage = path.join(devPackageRoot, TEMPLATE_RELATIVE_PATH);
    if (fs.existsSync(devFromPackage)) {
        return devFromPackage;
    }

    // Fallback 2: relative to this package's install location (bundled in dist/index.js)
    const distPackageRoot = path.resolve(__dirname, '..');
    const distFromPackage = path.join(distPackageRoot, TEMPLATE_RELATIVE_PATH);
    if (fs.existsSync(distFromPackage)) {
        return distFromPackage;
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

/** Default relative path from project root to the workflow templates directory. */
const WORKFLOWS_RELATIVE_PATH = 'docs/agent-guide/workflows';

/**
 * Resolve the absolute path to the workflow templates directory.
 *
 * Lookup order (same as getTemplatePath):
 * 1. Relative to the given project root (development / source checkout)
 * 2. Relative to the package install location (npm global install)
 */
export function getWorkflowsDir(projectRoot?: string): string {
    // Try project root first
    if (projectRoot) {
        const fromRoot = path.resolve(projectRoot, WORKFLOWS_RELATIVE_PATH);
        if (fs.existsSync(fromRoot) && fs.statSync(fromRoot).isDirectory()) {
            return fromRoot;
        }
    }

    // Fallback 1: we might be in development (src/core/install/template.ts)
    const devPackageRoot = path.resolve(__dirname, '..', '..', '..');
    const devFromPackage = path.join(devPackageRoot, WORKFLOWS_RELATIVE_PATH);
    if (fs.existsSync(devFromPackage) && fs.statSync(devFromPackage).isDirectory()) {
        return devFromPackage;
    }

    // Fallback 2: relative to this package's install location (bundled in dist/index.js)
    const distPackageRoot = path.resolve(__dirname, '..');
    const distFromPackage = path.join(distPackageRoot, WORKFLOWS_RELATIVE_PATH);
    if (fs.existsSync(distFromPackage) && fs.statSync(distFromPackage).isDirectory()) {
        return distFromPackage;
    }

    throw new Error(
        `Cannot find workflow templates at '${WORKFLOWS_RELATIVE_PATH}'. ` +
        'Ensure the pm package is installed correctly.'
    );
}

/**
 * Load all pm-*.md workflow template files from the workflows directory.
 *
 * Returns a Map<filename, content> of all workflow files.
 */
export function loadWorkflowTemplates(projectRoot?: string): Map<string, string> {
    const workflowsDir = getWorkflowsDir(projectRoot);
    const entries = fs.readdirSync(workflowsDir);
    const workflows = new Map<string, string>();

    for (const entry of entries) {
        if (entry.startsWith('pm-') && entry.endsWith('.md')) {
            const content = fs.readFileSync(path.join(workflowsDir, entry), 'utf-8');
            workflows.set(entry, content);
        }
    }

    return workflows;
}
