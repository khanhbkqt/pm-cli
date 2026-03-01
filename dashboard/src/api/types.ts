/**
 * Dashboard API types — mirrors the backend DB types for type-safe API consumption.
 */

export interface Agent {
    id: string;
    name: string;
    role: string;
    type: 'human' | 'ai';
    created_at: string;
}

export interface Plan {
    id: number;
    phase_id: number;
    number: number;
    name: string;
    wave: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    content: string | null;
    created_at: string;
    completed_at: string | null;
}

export interface ContextEntry {
    id: number;
    key: string;
    value: string;
    category: 'decision' | 'spec' | 'note' | 'constraint';
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Milestone {
    id: string;
    name: string;
    goal: string | null;
    status: 'planned' | 'active' | 'completed' | 'archived';
    created_by: string;
    created_at: string;
    completed_at: string | null;
}

export interface Phase {
    id: number;
    milestone_id: string;
    number: number;
    name: string;
    description: string | null;
    status: 'not_started' | 'planning' | 'in_progress' | 'completed' | 'skipped';
    created_at: string;
    completed_at: string | null;
}

export interface PhaseWithPlanCounts extends Phase {
    plans_total: number;
    plans_done: number;
}

export interface PhasesSummary {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
}

/** Lightweight milestone shape returned by /api/status. */
export interface MilestoneSummary {
    id: string;
    name: string;
    status: string;
}

export interface StatusResponse {
    milestone: MilestoneSummary | null;
    phases: PhasesSummary;
    plans: {
        total: number;
        by_status: Record<string, number>;
    };
    agents: {
        total: number;
        by_type: Record<string, number>;
    };
    context: {
        total: number;
    };
    recent_plans: Plan[];
}

/** Board hierarchy types for /api/board */
export interface BoardPhase extends Phase {
    plans: Plan[];
}

export interface BoardMilestone extends Milestone {
    phases: BoardPhase[];
}

export type BoardData = BoardMilestone[];
