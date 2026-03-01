import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchBoard } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import type { BoardMilestone, BoardPhase, Plan } from '../api/types';
import './BoardPage.css';

const MILESTONE_STATUS_CLASS: Record<string, string> = {
    planned: 'status--planned',
    active: 'status--active',
    completed: 'status--completed',
    archived: 'status--archived',
};

const PHASE_STATUS_CLASS: Record<string, string> = {
    not_started: 'status--planned',
    planning: 'status--planning',
    in_progress: 'status--active',
    completed: 'status--completed',
    skipped: 'status--archived',
};

const PLAN_STATUS_CLASS: Record<string, string> = {
    pending: 'status--planned',
    in_progress: 'status--active',
    completed: 'status--completed',
    failed: 'status--failed',
};

function formatStatus(s: string): string {
    return s.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function PlanCard({ plan }: { plan: Plan }) {
    return (
        <Link to={`/plans/${plan.id}`} className="board-plan-card__link">
            <div className="board-plan-card">
                <div className="board-plan-card__header">
                    <span className="board-plan-card__number">#{plan.number}</span>
                    <span className={`board-badge ${PLAN_STATUS_CLASS[plan.status] || ''}`}>
                        {formatStatus(plan.status)}
                    </span>
                </div>
                <div className="board-plan-card__name">{plan.name}</div>
                <div className="board-plan-card__meta">
                    <span className="board-plan-card__wave">Wave {plan.wave}</span>
                </div>
            </div>
        </Link>
    );
}

function PhaseSection({ phase }: { phase: BoardPhase }) {
    const [collapsed, setCollapsed] = useState(false);
    const planCount = phase.plans.length;

    return (
        <div className="board-phase">
            <button
                className="board-phase__header"
                onClick={() => setCollapsed(c => !c)}
                aria-expanded={!collapsed}
            >
                <span className="board-phase__toggle">{collapsed ? '▶' : '▼'}</span>
                <span className="board-phase__number">Phase {phase.number}</span>
                <span className="board-phase__name">{phase.name}</span>
                <span className={`board-badge ${PHASE_STATUS_CLASS[phase.status] || ''}`}>
                    {formatStatus(phase.status)}
                </span>
                <span className="board-phase__count">{planCount} plan{planCount !== 1 ? 's' : ''}</span>
            </button>

            {!collapsed && (
                <div className="board-phase__plans">
                    {planCount === 0 ? (
                        <div className="board-phase__empty">No plans in this phase</div>
                    ) : (
                        phase.plans.map(plan => <PlanCard key={plan.id} plan={plan} />)
                    )}
                </div>
            )}
        </div>
    );
}

function MilestoneSection({ milestone }: { milestone: BoardMilestone }) {
    const [collapsed, setCollapsed] = useState(false);
    const phaseCount = milestone.phases.length;
    const totalPlans = milestone.phases.reduce((sum, p) => sum + p.plans.length, 0);

    return (
        <div className="board-milestone">
            <button
                className="board-milestone__header"
                onClick={() => setCollapsed(c => !c)}
                aria-expanded={!collapsed}
            >
                <span className="board-milestone__toggle">{collapsed ? '▶' : '▼'}</span>
                <span className="board-milestone__icon">🎯</span>
                <span className="board-milestone__id">{milestone.id}</span>
                <span className="board-milestone__name">{milestone.name}</span>
                <span className={`board-badge ${MILESTONE_STATUS_CLASS[milestone.status] || ''}`}>
                    {formatStatus(milestone.status)}
                </span>
                <span className="board-milestone__meta">
                    {phaseCount} phase{phaseCount !== 1 ? 's' : ''} · {totalPlans} plan{totalPlans !== 1 ? 's' : ''}
                </span>
            </button>

            {!collapsed && (
                <div className="board-milestone__phases">
                    {phaseCount === 0 ? (
                        <div className="board-milestone__empty">No phases in this milestone</div>
                    ) : (
                        milestone.phases.map(phase => <PhaseSection key={phase.id} phase={phase} />)
                    )}
                </div>
            )}
        </div>
    );
}

export function BoardPage() {
    const { data: board, loading, error, refetch } = useApi(
        useCallback(() => fetchBoard(), [])
    );

    if (loading) {
        return (
            <div className="board-page">
                <LoadingSpinner message="Loading board..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="board-page">
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    const milestones = board || [];

    return (
        <div className="board-page">
            <div className="board-page__header">
                <span className="board-page__subtitle">
                    {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}
                </span>
            </div>

            {milestones.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="No milestones yet"
                    description="Run pm new-milestone to create your first milestone."
                />
            ) : (
                <div className="board-page__milestones">
                    {milestones.map(m => (
                        <MilestoneSection key={m.id} milestone={m} />
                    ))}
                </div>
            )}
        </div>
    );
}
