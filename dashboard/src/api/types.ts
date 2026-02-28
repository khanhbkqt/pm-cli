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

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to: string | null;
    created_by: string;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface TaskComment {
    id: number;
    task_id: number;
    agent_id: string;
    content: string;
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

export interface StatusResponse {
    tasks: {
        total: number;
        by_status: Record<string, number>;
        by_priority: Record<string, number>;
    };
    agents: {
        total: number;
        by_type: Record<string, number>;
    };
    context: {
        total: number;
    };
    recent_tasks: Task[];
}

/* ─── Mutation input types ─────────────────────────── */

export interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: string;
    assigned_to?: string;
    created_by: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
}

export interface AddCommentInput {
    agent_id: string;
    content: string;
}
