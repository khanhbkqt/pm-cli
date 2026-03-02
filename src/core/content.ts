import fs from 'fs';
import path from 'path';

const PM_DIR = '.pm';
const MILESTONES_DIR = 'milestones';

/**
 * Get the absolute path for a plan's content file.
 *
 * Layout: .pm/milestones/<milestoneId>/<phaseNumber>/<planNumber>-PLAN.md
 */
export function getPlanContentPath(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
    planNumber: number,
): string {
    return path.join(
        projectRoot,
        PM_DIR,
        MILESTONES_DIR,
        milestoneId,
        String(phaseNumber),
        `${planNumber}-PLAN.md`,
    );
}

/**
 * Ensure the directory for a plan file exists (creates intermediate dirs).
 */
export function ensurePlanDir(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
): void {
    const dir = path.join(
        projectRoot,
        PM_DIR,
        MILESTONES_DIR,
        milestoneId,
        String(phaseNumber),
    );
    fs.mkdirSync(dir, { recursive: true });
}

/**
 * Write plan content to its file. Creates intermediate directories as needed.
 */
export function writePlanContent(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
    planNumber: number,
    content: string,
): void {
    ensurePlanDir(projectRoot, milestoneId, phaseNumber);
    const filePath = getPlanContentPath(projectRoot, milestoneId, phaseNumber, planNumber);
    fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Read plan content from its file.
 * Returns null if the file does not exist.
 */
export function readPlanContent(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
    planNumber: number,
): string | null {
    const filePath = getPlanContentPath(projectRoot, milestoneId, phaseNumber, planNumber);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Delete a plan content file if it exists (e.g. when a plan is removed).
 */
export function deletePlanContent(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
    planNumber: number,
): void {
    const filePath = getPlanContentPath(projectRoot, milestoneId, phaseNumber, planNumber);
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
    }
}
