import { useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchMilestonePhases } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import type { PhaseWithPlanCounts } from '../api/types';
import './PhasesPage.css';

type StatusFilter = 'all' | 'not_started' | 'planning' | 'in_progress' | 'completed' | 'skipped';

function formatStatus(s: string): string {
    return s.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function PhasesPage() {
    const { milestoneId } = useParams<{ milestoneId: string }>();
    const { data: phases, loading, error, refetch } = useApi(
        useCallback(() => fetchMilestonePhases(milestoneId!), [milestoneId])
    );
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    if (loading) {
        return (
            <div className="phases-page">
                <LoadingSpinner message="Loading phases..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="phases-page">
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    const all = phases || [];
    const filtered = statusFilter === 'all' ? all : all.filter(p => p.status === statusFilter);

    return (
        <div className="phases-page">
            <nav className="phases-page__breadcrumb">
                <Link to="/milestones">Milestones</Link>
                <span className="phases-page__breadcrumb-sep">/</span>
                <span className="phases-page__breadcrumb-current">Phases</span>
            </nav>

            <div className="phases-page__toolbar">
                <div className="phases-page__status-filter">
                    {(['all', 'not_started', 'in_progress', 'completed'] as StatusFilter[]).map(s => (
                        <button
                            key={s}
                            className={`phases-page__status-btn ${statusFilter === s ? 'phases-page__status-btn--active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === 'all' ? 'All' : formatStatus(s)}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon="📦"
                    title={all.length === 0 ? 'No phases yet' : 'No phases match filter'}
                    description="Run pm phase add to create phases for this milestone."
                />
            ) : (
                <div className="phases-page__grid">
                    {filtered.map((p: PhaseWithPlanCounts) => {
                        const pct = p.plans_total > 0 ? Math.round((p.plans_done / p.plans_total) * 100) : 0;
                        return (
                            <Link
                                key={p.id}
                                to={`/phases/${p.id}/plans`}
                                className="phase-card"
                            >
                                <div className="phase-card__header">
                                    <span className="phase-card__number">{p.number}</span>
                                    <div className="phase-card__title">
                                        <span className="phase-card__name">{p.name}</span>
                                    </div>
                                    <span className={`phase-card__badge phase-card__badge--${p.status}`}>
                                        {formatStatus(p.status)}
                                    </span>
                                </div>
                                {p.description && (
                                    <p className="phase-card__description">{p.description}</p>
                                )}
                                <div className="phase-card__progress">
                                    <div className="phase-card__progress-bar">
                                        <div
                                            className="phase-card__progress-fill"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <div className="phase-card__progress-text">
                                        <span>{p.plans_done} / {p.plans_total} plans done</span>
                                        <span>{pct}%</span>
                                    </div>
                                </div>
                                <div className="phase-card__footer">
                                    <span className="phase-card__action">View Plans →</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
