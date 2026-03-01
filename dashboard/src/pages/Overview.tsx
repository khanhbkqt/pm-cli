import { useApi } from '../hooks/useApi';
import { fetchStatus, fetchAgents } from '../api';
import { StatsCards } from '../components/StatsCards';
import { AgentList } from '../components/AgentList';
import { ActivityFeed } from '../components/ActivityFeed';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import './Overview.css';

function MilestoneProgress({ status }: { status: { milestone: { name: string; status: string } | null; phases: { total: number; completed: number; in_progress: number; not_started: number } } }) {
    if (!status.milestone) return null;

    const { phases } = status;
    const pct = phases.total > 0 ? Math.round((phases.completed / phases.total) * 100) : 0;

    return (
        <div className="milestone-progress">
            <div className="milestone-progress__header">
                <div className="milestone-progress__title">
                    <span className="milestone-progress__icon">🎯</span>
                    <span>{status.milestone.name}</span>
                </div>
                <span className="milestone-progress__pct">{pct}%</span>
            </div>
            <div className="milestone-progress__bar">
                <div
                    className="milestone-progress__fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="milestone-progress__meta">
                <span>{phases.completed} completed</span>
                <span className="milestone-progress__sep">·</span>
                <span>{phases.in_progress} in progress</span>
                <span className="milestone-progress__sep">·</span>
                <span>{phases.not_started} remaining</span>
            </div>
        </div>
    );
}

export function Overview() {
    const { data: status, loading: statusLoading, error: statusError, refetch: refetchStatus } = useApi(fetchStatus);
    const { data: agents, loading: agentsLoading } = useApi(fetchAgents);

    const loading = statusLoading || agentsLoading;

    if (loading) {
        return (
            <div className="overview">
                <LoadingSpinner message="Loading dashboard..." />
            </div>
        );
    }

    if (statusError) {
        return (
            <div className="overview">
                <ErrorMessage message={statusError} onRetry={refetchStatus} />
            </div>
        );
    }

    if (!status) {
        return (
            <div className="overview">
                <EmptyState
                    icon="📊"
                    title="No project data"
                    description="Initialize a project with pm init to get started."
                />
            </div>
        );
    }

    return (
        <div className="overview">
            <StatsCards status={status} />
            <MilestoneProgress status={status} />
            <div className="overview__panels">
                <ActivityFeed plans={status.recent_plans} />
                <AgentList agents={agents ?? []} />
            </div>
        </div>
    );
}
