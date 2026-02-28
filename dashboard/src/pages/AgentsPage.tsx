import { useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { fetchAgents } from '../api/client';
import { getInitials, hashColor, relativeTime } from '../utils';
import { AgentDetailPanel } from '../components/AgentDetailPanel';
import type { Agent } from '../api/types';
import './AgentsPage.css';

type TypeFilter = 'all' | 'human' | 'ai';

export function AgentsPage() {
    const { data: agents, loading, error } = useApi(useCallback(() => fetchAgents(), []));
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="agents-page">
                <div className="agents-page__toolbar">
                    <div className="agents-page__search-wrap">
                        <span className="agents-page__search-icon">🔍</span>
                        <input
                            className="agents-page__search"
                            placeholder="Search agents…"
                            disabled
                        />
                    </div>
                </div>
                <div className="agents-page__grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="agent-card agent-card--skeleton">
                            <div className="agent-card__avatar skeleton" />
                            <div className="agent-card__info">
                                <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 6 }} />
                                <div className="skeleton" style={{ width: '40%', height: 12 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="agents-page">
                <div className="agents-page__error">
                    <span className="agents-page__error-icon">⚠️</span>
                    <p>Failed to load agents: {error}</p>
                </div>
            </div>
        );
    }

    const allAgents = agents || [];
    const filtered = allAgents.filter((a: Agent) => {
        const matchesSearch =
            !search ||
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.role.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || a.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="agents-page">
            <div className="agents-page__toolbar">
                <div className="agents-page__search-wrap">
                    <span className="agents-page__search-icon">🔍</span>
                    <input
                        className="agents-page__search"
                        placeholder="Search agents by name or role…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="agents-page__type-filter">
                    {(['all', 'human', 'ai'] as TypeFilter[]).map((t) => (
                        <button
                            key={t}
                            className={`agents-page__type-btn ${typeFilter === t ? 'agents-page__type-btn--active' : ''}`}
                            onClick={() => setTypeFilter(t)}
                        >
                            {t === 'all' ? 'All' : t === 'human' ? '👤 Human' : '🤖 AI'}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="agents-page__empty">
                    <span className="agents-page__empty-icon">👥</span>
                    <p className="agents-page__empty-text">
                        {allAgents.length === 0
                            ? 'No agents registered yet'
                            : 'No agents match your filters'}
                    </p>
                </div>
            ) : (
                <div className="agents-page__grid">
                    {filtered.map((agent: Agent) => (
                        <button
                            key={agent.id}
                            className="agent-card"
                            onClick={() => setSelectedAgentId(agent.id)}
                        >
                            <div
                                className="agent-card__avatar"
                                style={{
                                    background: `linear-gradient(135deg, ${hashColor(agent.name)}, ${hashColor(agent.name + '2')})`,
                                }}
                            >
                                {getInitials(agent.name)}
                            </div>
                            <div className="agent-card__info">
                                <div className="agent-card__name">{agent.name}</div>
                                <div className="agent-card__role">{agent.role}</div>
                            </div>
                            <div className="agent-card__meta">
                                <span className={`agent-card__badge agent-card__badge--${agent.type}`}>
                                    {agent.type === 'ai' ? 'AI' : 'Human'}
                                </span>
                                <span className="agent-card__time">{relativeTime(agent.created_at)}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <AgentDetailPanel
                agentId={selectedAgentId}
                onClose={() => setSelectedAgentId(null)}
            />
        </div>
    );
}
