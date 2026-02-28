import { useApi } from '../hooks/useApi';
import { fetchStatus, fetchAgents } from '../api';
import { StatsCards } from '../components/StatsCards';
import { AgentList } from '../components/AgentList';
import { ActivityFeed } from '../components/ActivityFeed';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import './Overview.css';

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
            <div className="overview__panels">
                <ActivityFeed tasks={status.recent_tasks} />
                <AgentList agents={agents ?? []} />
            </div>
        </div>
    );
}
