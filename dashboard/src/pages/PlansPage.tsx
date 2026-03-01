import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchPhasePlans } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { relativeTime } from '../utils';
import type { Plan } from '../api/types';
import './PlansPage.css';

const STATUS_COLORS: Record<string, string> = {
    pending: 'var(--text-secondary)',
    in_progress: 'var(--accent-blue)',
    completed: 'var(--accent-green)',
    failed: 'var(--accent-red)',
};

function formatStatus(s: string): string {
    return s.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const COLUMNS: Array<{ key: string; label: string }> = [
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'failed', label: 'Failed' },
];

export function PlansPage() {
    const { phaseId } = useParams<{ phaseId: string }>();
    const { data: plans, loading, error, refetch } = useApi(
        useCallback(() => fetchPhasePlans(Number(phaseId)), [phaseId])
    );

    if (loading) {
        return (
            <div className="plans-page">
                <LoadingSpinner message="Loading plans..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="plans-page">
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    const allPlans = plans || [];

    return (
        <div className="plans-page">
            <nav className="plans-page__breadcrumb">
                <Link to="/milestones">Milestones</Link>
                <span className="plans-page__breadcrumb-sep">/</span>
                <span className="plans-page__breadcrumb-current">Plans</span>
            </nav>

            <div className="plans-page__header">
                <span className="plans-page__title">Plans</span>
                <span className="plans-page__subtitle">
                    {allPlans.length} plan{allPlans.length !== 1 ? 's' : ''}
                </span>
            </div>

            {allPlans.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="No plans for this phase"
                    description="Run pm plan to create execution plans."
                />
            ) : (
                <div className="plans-kanban">
                    {COLUMNS.map(col => {
                        const colPlans = allPlans.filter((p: Plan) => p.status === col.key);
                        return (
                            <div key={col.key} className="plans-kanban__column">
                                <div className="plans-kanban__column-header">
                                    <span
                                        className="plans-kanban__dot"
                                        style={{ background: STATUS_COLORS[col.key] }}
                                    />
                                    <span className="plans-kanban__column-title">{col.label}</span>
                                    <span className="plans-kanban__column-count">{colPlans.length}</span>
                                </div>
                                <div className="plans-kanban__cards">
                                    {colPlans.length === 0 ? (
                                        <div className="plans-kanban__empty">No {col.label.toLowerCase()}</div>
                                    ) : (
                                        colPlans.map((plan: Plan) => (
                                            <div key={plan.id} className="plan-card">
                                                <div className="plan-card__name">{plan.name}</div>
                                                <div className="plan-card__meta">
                                                    <span className="plan-card__wave">W{plan.wave}</span>
                                                    <span
                                                        className="plan-card__status"
                                                        style={{ color: STATUS_COLORS[plan.status] }}
                                                    >
                                                        {formatStatus(plan.status)}
                                                    </span>
                                                    <span className="plan-card__time">
                                                        {relativeTime(plan.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
