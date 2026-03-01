import type Database from 'better-sqlite3';
import type { Milestone, Phase, Plan, WorkflowState } from '../db/types.js';
import { getMilestoneById, updateMilestone, getActiveMilestone } from './milestone.js';
import { getPhaseById, updatePhase, listPhases } from './phase.js';
import { getPlanById, updatePlan, listPlans } from './plan.js';
import { getAgentById } from './agent.js';

// --- Status type aliases ---

export type MilestoneStatus = Milestone['status'];
export type PhaseStatus = Phase['status'];
export type PlanStatus = Plan['status'];

// --- Transition maps ---

export const MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
    planned: ['active'],
    active: ['completed', 'archived'],
    completed: ['archived'],
    archived: [],
};

export const PHASE_TRANSITIONS: Record<PhaseStatus, PhaseStatus[]> = {
    not_started: ['planning', 'in_progress', 'skipped'],
    planning: ['in_progress', 'skipped'],
    in_progress: ['completed', 'skipped'],
    completed: [],
    skipped: ['not_started'],
};

export const PLAN_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
    pending: ['in_progress'],
    in_progress: ['completed', 'failed'],
    completed: [],
    failed: ['pending'],
};

// --- Validation helper ---

/**
 * Validate that a status transition is allowed. Throws a descriptive error if not.
 */
export function validateTransition<T extends string>(
    current: T,
    next: T,
    map: Record<T, T[]>,
    entityName: string,
): void {
    const valid = map[current];
    if (!valid || !valid.includes(next)) {
        const validList = valid && valid.length > 0 ? valid.join(', ') : '(none — terminal state)';
        throw new Error(
            `Cannot transition ${entityName} from '${current}' to '${next}'. Valid transitions: ${validList}`,
        );
    }
}

// --- Transition functions ---

/**
 * Transition a milestone to a new status with validation and business rules.
 *
 * Rules:
 * - Validates transition is allowed (unless force: true)
 * - Activating a milestone deactivates any currently active milestone (single-active rule)
 * - Completing a milestone requires ALL phases to be completed or skipped
 */
export function transitionMilestone(
    db: Database.Database,
    id: string,
    newStatus: MilestoneStatus,
    opts?: { force?: boolean },
): Milestone {
    const milestone = getMilestoneById(db, id);
    if (!milestone) {
        throw new Error(`Milestone '${id}' not found.`);
    }

    if (!opts?.force) {
        validateTransition(milestone.status, newStatus, MILESTONE_TRANSITIONS, 'milestone');
    }

    // Single-active rule: deactivate current active milestone
    if (newStatus === 'active') {
        const currentActive = getActiveMilestone(db);
        if (currentActive && currentActive.id !== id) {
            updateMilestone(db, currentActive.id, { status: 'planned' });
        }
    }

    // Completion guard: all phases must be completed or skipped (unless --force)
    if (newStatus === 'completed' && !opts?.force) {
        const phases = listPhases(db, id);
        const incomplete = phases.filter(
            (p) => p.status !== 'completed' && p.status !== 'skipped',
        );
        if (incomplete.length > 0) {
            const names = incomplete.map((p) => `Phase ${p.number} (${p.name}: ${p.status})`).join(', ');
            throw new Error(
                `Cannot complete milestone '${id}': ${incomplete.length} phase(s) not completed or skipped: ${names}`,
            );
        }
    }

    return updateMilestone(db, id, { status: newStatus });
}

/**
 * Transition a phase to a new status with validation.
 */
export function transitionPhase(
    db: Database.Database,
    id: string,
    newStatus: PhaseStatus,
    opts?: { force?: boolean },
): Phase {
    const phase = getPhaseById(db, id);
    if (!phase) {
        throw new Error(`Phase '${id}' not found.`);
    }

    if (!opts?.force) {
        validateTransition(phase.status, newStatus, PHASE_TRANSITIONS, 'phase');
    }

    return updatePhase(db, id, { status: newStatus });
}

/**
 * Transition a plan to a new status with validation and cascading behaviors.
 *
 * Cascading:
 * - Plan pending → in_progress: auto-starts parent phase if not_started
 * - Plan → completed: if ALL plans in phase are completed, auto-completes phase
 */
export function transitionPlan(
    db: Database.Database,
    id: string,
    newStatus: PlanStatus,
    opts?: { force?: boolean },
): Plan {
    const plan = getPlanById(db, id);
    if (!plan) {
        throw new Error(`Plan '${id}' not found.`);
    }

    if (!opts?.force) {
        validateTransition(plan.status, newStatus, PLAN_TRANSITIONS, 'plan');
    }

    // Cascade: plan start → auto-start phase
    if (newStatus === 'in_progress' && plan.status === 'pending') {
        const phase = getPhaseById(db, plan.phase_id);
        if (phase && phase.status === 'not_started') {
            updatePhase(db, phase.id, { status: 'in_progress' });
        }
    }

    // Update the plan
    const updatedPlan = updatePlan(db, id, { status: newStatus });

    // Cascade: all plans completed → auto-complete phase
    if (newStatus === 'completed') {
        const allPlans = listPlans(db, plan.phase_id);
        const allCompleted = allPlans.every((p) => p.status === 'completed');
        if (allCompleted) {
            const phase = getPhaseById(db, plan.phase_id);
            if (phase && phase.status !== 'completed') {
                updatePhase(db, phase.id, { status: 'completed' });
            }
        }
    }

    return updatedPlan;
}

// --- Workflow State CRUD ---

/**
 * Get a workflow state value by key.
 */
export function getWorkflowState(db: Database.Database, key: string): string | undefined {
    const row = db.prepare('SELECT value FROM workflow_state WHERE key = ?').get(key) as
        | { value: string }
        | undefined;
    return row?.value;
}

/**
 * Set a workflow state value (upsert). Creates or updates the key-value pair.
 */
export function setWorkflowState(
    db: Database.Database,
    key: string,
    value: string,
    updated_by: string,
): WorkflowState {
    const agent = getAgentById(db, updated_by);
    if (!agent) {
        throw new Error(`Agent '${updated_by}' not found.`);
    }

    db.prepare(
        `INSERT INTO workflow_state (key, value, updated_by, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP`,
    ).run(key, value, updated_by);

    return db.prepare('SELECT * FROM workflow_state WHERE key = ?').get(key) as WorkflowState;
}

/**
 * List all workflow state entries, ordered by key.
 */
export function listWorkflowState(db: Database.Database): WorkflowState[] {
    return db.prepare('SELECT * FROM workflow_state ORDER BY key ASC').all() as WorkflowState[];
}
