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

export interface StatusResponse {
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
