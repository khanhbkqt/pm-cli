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

function PlanRow({ plan }: { plan: Plan }) {
    return (
        <Link
            to={`/plans/${plan.id}`}
            className="tree-row tree-row--plan"
            aria-label={`Plan ${plan.number}: ${plan.name}`}
        >
            <span className="tree-row__expand" aria-hidden="true" />
            <span className="tree-row__icon" aria-hidden="true">📄</span>
            <span className="tree-row__id">#{plan.number}</span>
            <span className="tree-row__name">{plan.name}</span>
            <span className="tree-row__status">
                <span className={`board-badge ${PLAN_STATUS_CLASS[plan.status] || ''}`}>
                    {formatStatus(plan.status)}
                </span>
            </span>
            <span className="tree-row__meta">Wave {plan.wave}</span>
        </Link>
    );
}

function PhaseRow({ phase }: { phase: BoardPhase }) {
    const [expanded, setExpanded] = useState(phase.status === 'in_progress');
    const planCount = phase.plans.length;

    return (
        <>
            <div
                className="tree-row tree-row--phase"
                onClick={() => setExpanded(e => !e)}
                aria-expanded={expanded}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setExpanded(v => !v)}
            >
                <button
                    className="tree-row__expand"
                    onClick={ev => { ev.stopPropagation(); setExpanded(v => !v); }}
                    aria-label={expanded ? 'Collapse phase' : 'Expand phase'}
                >
                    {expanded ? '▼' : '▶'}
                </button>
                <span className="tree-row__icon" aria-hidden="true">📁</span>
                <span className="tree-row__id">P{phase.number}</span>
                <span className="tree-row__name">{phase.name}</span>
                <span className="tree-row__status">
                    <span className={`board-badge ${PHASE_STATUS_CLASS[phase.status] || ''}`}>
                        {formatStatus(phase.status)}
                    </span>
                </span>
                <span className="tree-row__meta">
                    {planCount} plan{planCount !== 1 ? 's' : ''}
                </span>
            </div>

            <div
                className={`tree-children${expanded ? '' : ' tree-children--collapsed'}`}
                style={{ maxHeight: expanded ? planCount * 44 + 'px' : undefined }}
            >
                {planCount === 0 ? (
                    <div className="tree-row tree-row--plan" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        <span className="tree-row__name">No plans in this phase</span>
                    </div>
                ) : (
                    phase.plans.map(plan => <PlanRow key={plan.id} plan={plan} />)
                )}
            </div>
        </>
    );
}

function MilestoneRow({ milestone }: { milestone: BoardMilestone }) {
    const [expanded, setExpanded] = useState(milestone.status === 'active');
    const phaseCount = milestone.phases.length;
    const totalPlans = milestone.phases.reduce((sum, p) => sum + p.plans.length, 0);
    const childHeight = milestone.phases.reduce(
        (sum, p) => sum + 44 + (p.status === 'in_progress' ? p.plans.length * 44 : 0),
        0
    );

    return (
        <>
            <div
                className="tree-row tree-row--milestone"
                onClick={() => setExpanded(e => !e)}
                aria-expanded={expanded}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setExpanded(v => !v)}
            >
                <button
                    className="tree-row__expand"
                    onClick={ev => { ev.stopPropagation(); setExpanded(v => !v); }}
                    aria-label={expanded ? 'Collapse milestone' : 'Expand milestone'}
                >
                    {expanded ? '▼' : '▶'}
                </button>
                <span className="tree-row__icon" aria-hidden="true">🎯</span>
                <span className="tree-row__id">{milestone.id}</span>
                <span className="tree-row__name">{milestone.name}</span>
                <span className="tree-row__status">
                    <span className={`board-badge ${MILESTONE_STATUS_CLASS[milestone.status] || ''}`}>
                        {formatStatus(milestone.status)}
                    </span>
                </span>
                <span className="tree-row__meta">
                    {phaseCount} phase{phaseCount !== 1 ? 's' : ''} · {totalPlans} plan{totalPlans !== 1 ? 's' : ''}
                </span>
            </div>

            <div
                className={`tree-children${expanded ? '' : ' tree-children--collapsed'}`}
                style={{ maxHeight: expanded ? childHeight + 400 + 'px' : undefined }}
            >
                {phaseCount === 0 ? (
                    <div className="tree-row tree-row--phase" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        <span className="tree-row__name">No phases in this milestone</span>
                    </div>
                ) : (
                    milestone.phases.map(phase => <PhaseRow key={phase.id} phase={phase} />)
                )}
            </div>
        </>
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
                <h1>Plans Board</h1>
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
                <div className="board-tree" role="tree" aria-label="Plans hierarchy">
                    <div className="board-tree__header" aria-hidden="true">
                        <span className="board-tree__col-name">Name</span>
                        <span className="board-tree__col-status">Status</span>
                        <span className="board-tree__col-details">Details</span>
                    </div>
                    <div className="board-tree__body">
                        {milestones.map(m => (
                            <MilestoneRow key={m.id} milestone={m} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
