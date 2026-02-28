import type { StatusResponse, Task, Agent, ContextEntry } from './types';

/**
 * Base fetch wrapper with error handling.
 */
async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(path);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/** Fetch project status overview. */
export function fetchStatus(): Promise<StatusResponse> {
    return apiFetch<StatusResponse>('/api/status');
}

/** Fetch tasks with optional query filters. */
export async function fetchTasks(filters?: Record<string, string>): Promise<Task[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiFetch<{ tasks: Task[] }>(`/api/tasks${params}`);
    return res.tasks;
}

/** Fetch all registered agents. */
export async function fetchAgents(): Promise<Agent[]> {
    const res = await apiFetch<{ agents: Agent[] }>('/api/agents');
    return res.agents;
}

/** Fetch context entries with optional query filters. */
export async function fetchContext(filters?: Record<string, string>): Promise<ContextEntry[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiFetch<{ entries: ContextEntry[] }>(`/api/context${params}`);
    return res.entries;
}
