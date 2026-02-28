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
