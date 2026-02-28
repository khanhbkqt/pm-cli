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
export function fetchTasks(filters?: Record<string, string>): Promise<Task[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return apiFetch<Task[]>(`/api/tasks${params}`);
}

/** Fetch all registered agents. */
export function fetchAgents(): Promise<Agent[]> {
    return apiFetch<Agent[]>('/api/agents');
}

/** Fetch context entries with optional query filters. */
export function fetchContext(filters?: Record<string, string>): Promise<ContextEntry[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return apiFetch<ContextEntry[]>(`/api/context${params}`);
}
