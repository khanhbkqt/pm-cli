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

// ---------------------------------------------------------------------------
// Milestone content helpers
// ---------------------------------------------------------------------------

/**
 * Get the absolute path for a milestone's content file.
 *
 * Layout: .pm/milestones/<milestoneId>/MILESTONE.md
 */
export function getMilestoneContentPath(projectRoot: string, milestoneId: string): string {
    return path.join(projectRoot, PM_DIR, MILESTONES_DIR, milestoneId, 'MILESTONE.md');
}

/**
 * Write milestone content to its file. Creates intermediate directories as needed.
 */
export function writeMilestoneContent(
    projectRoot: string,
    milestoneId: string,
    content: string,
): void {
    const dir = path.join(projectRoot, PM_DIR, MILESTONES_DIR, milestoneId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getMilestoneContentPath(projectRoot, milestoneId), content, 'utf-8');
}

/**
 * Read milestone content from its file.
 * Returns null if the file does not exist.
 */
export function readMilestoneContent(
    projectRoot: string,
    milestoneId: string,
): string | null {
    const filePath = getMilestoneContentPath(projectRoot, milestoneId);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
}

// ---------------------------------------------------------------------------
// Phase content helpers
// ---------------------------------------------------------------------------

/**
 * Get the absolute path for a phase's content file.
 *
 * Layout: .pm/milestones/<milestoneId>/<phaseNumber>/PHASE.md
 */
export function getPhaseContentPath(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
): string {
    return path.join(
        projectRoot,
        PM_DIR,
        MILESTONES_DIR,
        milestoneId,
        String(phaseNumber),
        'PHASE.md',
    );
}

/**
 * Write phase content to its file. Creates intermediate directories as needed.
 */
export function writePhaseContent(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
    content: string,
): void {
    const dir = path.join(
        projectRoot,
        PM_DIR,
        MILESTONES_DIR,
        milestoneId,
        String(phaseNumber),
    );
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getPhaseContentPath(projectRoot, milestoneId, phaseNumber), content, 'utf-8');
}

/**
 * Read phase content from its file.
 * Returns null if the file does not exist.
 */
export function readPhaseContent(
    projectRoot: string,
    milestoneId: string,
    phaseNumber: number,
): string | null {
    const filePath = getPhaseContentPath(projectRoot, milestoneId, phaseNumber);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
}
