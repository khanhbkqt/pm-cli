import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { fetchBoard } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import type { BoardMilestone, BoardPhase, Plan } from '../api/types';
import { ProgressBar } from '../components/ProgressBar';
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
            <span className="tree-row__progress"></span>
            <span className="tree-row__status">
                <span className={`board-badge ${PLAN_STATUS_CLASS[plan.status] || ''}`}>
                    {formatStatus(plan.status)}
                </span>
            </span>
            <span className="tree-row__meta">Wave {plan.wave}</span>
        </Link>
    );
}

function PhaseRow({ phase, expandAllSignal }: { phase: BoardPhase, expandAllSignal: { ts: number, expand: boolean } | null }) {
    const [expanded, setExpanded] = useState(phase.status === 'in_progress');

    useEffect(() => {
        if (expandAllSignal) {
            setExpanded(expandAllSignal.expand);
        }
    }, [expandAllSignal]);
    const planCount = phase.plans.length;
    const completedPlans = phase.plans.filter(p => p.status === 'completed').length;
    const progress = planCount > 0 ? (completedPlans / planCount) * 100 : 0;

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
                <span className="tree-row__progress">
                    <ProgressBar progress={progress} />
                </span>
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

function MilestoneRow({ milestone, expandAllSignal }: { milestone: BoardMilestone, expandAllSignal: { ts: number, expand: boolean } | null }) {
    const [expanded, setExpanded] = useState(milestone.status === 'active');

    useEffect(() => {
        if (expandAllSignal) {
            setExpanded(expandAllSignal.expand);
        }
    }, [expandAllSignal]);
    const phaseCount = milestone.phases.length;
    const totalPlans = milestone.phases.reduce((sum, p) => sum + p.plans.length, 0);
    const totalCompletedPlans = milestone.phases.reduce(
        (sum, p) => sum + p.plans.filter(plan => plan.status === 'completed').length,
        0
    );
    const progress = totalPlans > 0 ? (totalCompletedPlans / totalPlans) * 100 : 0;

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
                <span className="tree-row__progress">
                    <ProgressBar progress={progress} />
                </span>
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
                    milestone.phases.map(phase => <PhaseRow key={phase.id} phase={phase} expandAllSignal={expandAllSignal} />)
                )}
            </div>
        </>
    );
}

export function BoardPage() {
    const { data: board, loading, error, refetch } = useApi(
        useCallback(() => fetchBoard(), [])
    );
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandSignal, setExpandSignal] = useState<{ ts: number; expand: boolean } | null>(null);

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
    const filteredMilestones = milestones.filter(m => statusFilter === 'all' || m.status === statusFilter);

    return (
        <div className="board-page">
            <div className="board-page__header">
                <div className="board-page__header-title">
                    <h1>Plans Board</h1>
                    <span className="board-page__subtitle">
                        {filteredMilestones.length} milestone{filteredMilestones.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="board-page__controls">
                    <div className="board-filter" role="group" aria-label="Filter by milestone status">
                        {['all', 'active', 'planned', 'completed', 'archived'].map(status => (
                            <button
                                key={status}
                                className={`board-filter__btn ${statusFilter === status ? 'board-filter__btn--active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="board-actions">
                        <button className="board-action__btn" onClick={() => setExpandSignal({ ts: Date.now(), expand: true })}>Expand All</button>
                        <button className="board-action__btn" onClick={() => setExpandSignal({ ts: Date.now(), expand: false })}>Collapse All</button>
                    </div>
                </div>
            </div>

            {filteredMilestones.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title={milestones.length === 0 ? "No milestones yet" : "No milestones found"}
                    description={milestones.length === 0 ? "Run pm new-milestone to create your first milestone." : "Try adjusting your filters."}
                />
            ) : (
                <div className="board-tree" role="tree" aria-label="Plans hierarchy">
                    <div className="board-tree__header" aria-hidden="true">
                        <span className="board-tree__col-name">Name</span>
                        <span className="board-tree__col-progress">Progress</span>
                        <span className="board-tree__col-status">Status</span>
                        <span className="board-tree__col-details">Details</span>
                    </div>
                    <div className="board-tree__body">
                        {filteredMilestones.map(m => (
                            <MilestoneRow key={m.id} milestone={m} expandAllSignal={expandSignal} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
