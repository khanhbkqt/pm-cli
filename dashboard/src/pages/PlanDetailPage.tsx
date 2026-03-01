import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchPlanById } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import MarkdownView from '../components/MarkdownView';
import { relativeTime } from '../utils';
import './PlanDetailPage.css';

const STATUS_COLORS: Record<string, string> = {
    pending: 'var(--text-secondary)',
    in_progress: 'var(--accent-blue)',
    completed: 'var(--accent-green)',
    failed: 'var(--accent-red)',
};

function formatStatus(s: string): string {
    return s.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function PlanDetailPage() {
    const { planId } = useParams<{ planId: string }>();
    const { data: plan, loading, error, refetch } = useApi(
        useCallback(() => fetchPlanById(planId ?? ''), [planId])
    );

    if (loading) {
        return (
            <div className="plan-detail">
                <LoadingSpinner message="Loading plan..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="plan-detail">
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="plan-detail">
                <EmptyState icon="📋" title="Plan not found" description="This plan does not exist." />
            </div>
        );
    }

    return (
        <div className="plan-detail">
            <nav className="plan-detail__breadcrumb">
                <Link to="/milestones">Milestones</Link>
                <span className="plan-detail__breadcrumb-sep">/</span>
                <span className="plan-detail__breadcrumb-current">Plan #{plan.number}</span>
            </nav>

            <div className="plan-detail__header">
                <h1 className="plan-detail__title">{plan.name}</h1>
                <div className="plan-detail__meta">
                    <span
                        className="plan-detail__status"
                        style={{ color: STATUS_COLORS[plan.status] }}
                    >
                        <span
                            className="plan-detail__status-dot"
                            style={{ background: STATUS_COLORS[plan.status] }}
                        />
                        {formatStatus(plan.status)}
                    </span>
                    <span className="plan-detail__wave">Wave {plan.wave}</span>
                    <span className="plan-detail__time">
                        Created {relativeTime(plan.created_at)}
                    </span>
                    {plan.completed_at && (
                        <span className="plan-detail__time">
                            Completed {relativeTime(plan.completed_at)}
                        </span>
                    )}
                </div>
            </div>

            <div className="plan-detail__content">
                {plan.content ? (
                    <MarkdownView content={plan.content} />
                ) : (
                    <EmptyState
                        icon="📝"
                        title="No content"
                        description="This plan has no content yet."
                    />
                )}
            </div>

            <div className="plan-detail__footer">
                <Link to={`/phases/${plan.phase_id}/plans`} className="plan-detail__back">
                    ← Back to Plans
                </Link>
            </div>
        </div>
    );
}
