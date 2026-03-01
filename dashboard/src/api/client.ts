import type { StatusResponse, Plan, Agent, ContextEntry, Milestone, PhaseWithPlanCounts, PhasesSummary } from './types';

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
export async function fetchPhasePlans(phaseId: number): Promise<Plan[]> {
    const res = await apiFetch<{ plans: Plan[] }>(`/api/phases/${phaseId}/plans`);
    return res.plans;
}

// Re-export Plan for downstream consumers
export type { Plan };
