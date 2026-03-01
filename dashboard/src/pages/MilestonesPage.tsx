import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchMilestones } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { relativeTime } from '../utils';
import type { Milestone } from '../api/types';
import './MilestonesPage.css';

type StatusFilter = 'all' | 'planned' | 'active' | 'completed' | 'archived';

export function MilestonesPage() {
    const { data: milestones, loading, error, refetch } = useApi(useCallback(() => fetchMilestones(), []));
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    if (loading) {
        return (
            <div className="milestones-page">
                <LoadingSpinner message="Loading milestones..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="milestones-page">
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    const all = milestones || [];
    const filtered = statusFilter === 'all' ? all : all.filter(m => m.status === statusFilter);

    return (
        <div className="milestones-page">
            <div className="milestones-page__toolbar">
                <div className="milestones-page__status-filter">
                    {(['all', 'planned', 'active', 'completed', 'archived'] as StatusFilter[]).map(s => (
                        <button
                            key={s}
                            className={`milestones-page__status-btn ${statusFilter === s ? 'milestones-page__status-btn--active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon="🎯"
                    title={all.length === 0 ? 'No milestones yet' : 'No milestones match filter'}
                    description="Run pm milestone new to create a milestone."
                />
            ) : (
                <div className="milestones-page__grid">
                    {filtered.map((m: Milestone) => (
                        <Link
                            key={m.id}
                            to={`/milestones/${m.id}/phases`}
                            className={`milestone-card ${m.status === 'active' ? 'milestone-card--active' : ''}`}
                        >
                            <div className="milestone-card__header">
                                <span className="milestone-card__name">{m.name}</span>
                                <span className={`milestone-card__badge milestone-card__badge--${m.status}`}>
                                    {m.status}
                                </span>
                            </div>
                            {m.goal && (
                                <p className="milestone-card__goal">{m.goal}</p>
                            )}
                            <div className="milestone-card__footer">
                                <span className="milestone-card__time">{relativeTime(m.created_at)}</span>
                                <span className="milestone-card__action">View Phases →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
