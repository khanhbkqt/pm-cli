import fs from 'fs';
import path from 'path';

const GSD_TEMPLATES_DIR = '.gsd/templates';

/**
 * Load a GSD template file by name.
 * Returns the raw template string, or null if the file doesn't exist.
 */
export function loadGsdTemplate(projectRoot: string, templateName: string): string | null {
    const templatePath = path.join(projectRoot, GSD_TEMPLATES_DIR, templateName);
    if (!fs.existsSync(templatePath)) {
        return null;
    }
    return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Populate a PLAN.md template with plan-specific variables.
 *
 * Variables replaced:
 * - `{N}` → phaseNumber
 * - `{M}` → planNumber
 * - `{W}` → wave
 * - `{Descriptive Name}` → name
 * - `Plan {N}.{M}:` headings → `Plan <phaseNumber>.<planNumber>:`
 */
export function populatePlanTemplate(
    raw: string,
    vars: { phaseNumber: number; planNumber: number; wave: number; name: string },
): string {
    const { phaseNumber, planNumber, wave, name } = vars;
    return raw
        .replaceAll('{N}', String(phaseNumber))
        .replaceAll('{M}', String(planNumber))
        .replaceAll('{W}', String(wave))
        .replaceAll('{Descriptive Name}', name);
}

/**
 * Populate a milestone.md template with milestone-specific variables.
 *
 * Variables replaced:
 * - `{milestone-name}` → id (used in frontmatter `name:` field)
 * - `{name}` → name (the human-readable milestone title)
 * - `[ISO timestamp]` → date (e.g. "2026-03-02")
 * - `planning | active | complete | archived` → `planning`
 */
export function populateMilestoneTemplate(
    raw: string,
    vars: { id: string; name: string; date: string },
): string {
    const { id, name, date } = vars;
    return raw
        .replaceAll('{milestone-name}', id)
        .replaceAll('{name}', name)
        .replaceAll('[ISO timestamp]', date)
        .replaceAll('planning | active | complete | archived', 'planning');
}

/**
 * Populate a phase-summary.md template with phase-specific variables.
 *
 * Variables replaced:
 * - `{N}` → phaseNumber
 * - `{Phase Name}` → name
 * - `{What this phase set out to accomplish.}` → name
 * - `YYYY-MM-DD` → date (e.g. "2026-03-02")
 */
export function populatePhaseTemplate(
    raw: string,
    vars: { phaseNumber: number; name: string; date: string },
): string {
    const { phaseNumber, name, date } = vars;
    return raw
        .replaceAll('{N}', String(phaseNumber))
        .replaceAll('{Phase Name}', name)
        .replaceAll('{What this phase set out to accomplish.}', name)
        .replaceAll('YYYY-MM-DD', date);
}
