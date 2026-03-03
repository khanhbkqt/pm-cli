import type { StatusResponse, Plan, Agent, ContextEntry, Milestone, PhaseWithPlanCounts, PhasesSummary, BoardMilestone, Bug } from './types';

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

/* ─── Read endpoints ───────────────────────────────── */

/** Fetch project status overview. */
export function fetchStatus(): Promise<StatusResponse> {
    return apiFetch<StatusResponse>('/api/status');
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

/** Fetch a single agent by ID. */
export async function fetchAgentById(id: string): Promise<Agent> {
    const res = await apiFetch<{ agent: Agent }>(`/api/agents/${id}`);
    return res.agent;
}

/** Search context entries by query string. */
export async function searchContext(query: string): Promise<ContextEntry[]> {
    const res = await apiFetch<{ entries: ContextEntry[] }>(`/api/context/search?q=${encodeURIComponent(query)}`);
    return res.entries;
}

/* ─── Milestone / Phase / Plan endpoints ───────────── */

/** Fetch all milestones, optional status filter. */
export async function fetchMilestones(status?: string): Promise<Milestone[]> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await apiFetch<{ milestones: Milestone[] }>(`/api/milestones${qs}`);
    return res.milestones;
}

/** Fetch the active milestone with phase summary. */
export async function fetchActiveMilestone(): Promise<{ milestone: Milestone; phases_summary: PhasesSummary }> {
    return apiFetch<{ milestone: Milestone; phases_summary: PhasesSummary }>('/api/milestones/active');
}

/** Fetch phases for a milestone (enriched with plan counts). */
export async function fetchMilestonePhases(milestoneId: string): Promise<PhaseWithPlanCounts[]> {
    const res = await apiFetch<{ phases: PhaseWithPlanCounts[] }>(`/api/milestones/${encodeURIComponent(milestoneId)}/phases`);
    return res.phases;
}

/** Fetch plans for a specific phase. */
export async function fetchPhasePlans(phaseId: string): Promise<Plan[]> {
    const res = await apiFetch<{ plans: Plan[] }>(`/api/phases/${phaseId}/plans`);
    return res.plans;
}

/** Fetch a single plan by ID. */
export async function fetchPlanById(id: string): Promise<Plan> {
    const res = await apiFetch<{ plan: Plan }>(`/api/plans/${id}`);
    return res.plan;
}

// Re-export Plan for downstream consumers
export type { Plan };

/** Fetch the full board hierarchy (Milestones → Phases → Plans). */
export async function fetchBoard(): Promise<BoardMilestone[]> {
    const res = await apiFetch<{ board: BoardMilestone[] }>('/api/board');
    return res.board;
}

/* ─── Bug endpoints ────────────────────────────────── */

/** Fetch bugs with optional filters. */
export async function fetchBugs(filters?: Record<string, string>): Promise<Bug[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await apiFetch<{ bugs: Bug[] }>(`/api/bugs${params}`);
    return res.bugs;
}

/** Fetch a single bug by ID (includes filesystem content). */
export async function fetchBugById(id: string): Promise<Bug> {
    const res = await apiFetch<{ bug: Bug }>(`/api/bugs/${id}`);
    return res.bug;
}

/** Report a new bug. */
export async function reportBugApi(params: {
    title: string;
    description?: string;
    priority?: string;
    reported_by: string;
    milestone_id?: string;
    phase_id?: string;
    blocking?: boolean;
}): Promise<Bug> {
    const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `API error: ${res.status}`);
    }
    const data = await res.json();
    return data.bug;
}

/** Update a bug. */
export async function updateBugApi(id: string, updates: Record<string, any>): Promise<Bug> {
    const res = await fetch(`/api/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `API error: ${res.status}`);
    }
    const data = await res.json();
    return data.bug;
}
