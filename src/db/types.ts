/**
 * TypeScript interfaces matching the SQLite schema.
 */

export interface Agent {
    id: string;
    name: string;
    role: string;
    type: 'human' | 'ai';
    created_at: string;
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

export interface WorkflowState {
    id: number;
    key: string;
    value: string;
    updated_by: string;
    updated_at: string;
}

