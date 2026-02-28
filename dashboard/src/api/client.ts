import type {
    StatusResponse,
    Task,
    Agent,
    ContextEntry,
    TaskComment,
    CreateTaskInput,
    UpdateTaskInput,
    AddCommentInput,
} from './types';

/**
 * Base GET fetch wrapper with error handling.
 */
async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(path);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/**
 * POST helper with JSON body.
 */
async function apiPost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/**
 * PUT helper with JSON body.
 */
async function apiPut<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

/* ─── Read endpoints ───────────────────────────────── */

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

/* ─── Mutation endpoints ───────────────────────────── */

/** Create a new task. */
export async function createTask(data: CreateTaskInput): Promise<Task> {
    const res = await apiPost<{ task: Task }>('/api/tasks', data);
    return res.task;
}

/** Update an existing task. */
export async function updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
    const res = await apiPut<{ task: Task }>(`/api/tasks/${id}`, data);
    return res.task;
}

/** Assign an agent to a task. */
export async function assignTask(id: number, agentId: string): Promise<Task> {
    const res = await apiPost<{ task: Task }>(`/api/tasks/${id}/assign`, { agent_id: agentId });
    return res.task;
}

/** Fetch comments for a task. */
export async function fetchTaskComments(taskId: number): Promise<TaskComment[]> {
    const res = await apiFetch<{ comments: TaskComment[] }>(`/api/tasks/${taskId}/comments`);
    return res.comments;
}

/** Add a comment to a task. */
export async function addTaskComment(id: number, data: AddCommentInput): Promise<TaskComment> {
    const res = await apiPost<{ comment: TaskComment }>(`/api/tasks/${id}/comments`, data);
    return res.comment;
}
