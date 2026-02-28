import { useApi } from '../hooks/useApi';
import { fetchStatus, fetchAgents } from '../api';
import { StatsCards } from '../components/StatsCards';
import { AgentList } from '../components/AgentList';
import { ActivityFeed } from '../components/ActivityFeed';
import './Overview.css';

export function Overview() {
    const { data: status, loading: statusLoading, error: statusError } = useApi(fetchStatus);
    const { data: agents, loading: agentsLoading } = useApi(fetchAgents);

    const loading = statusLoading || agentsLoading;

    if (loading) {
        return (
            <div className="overview">
                <div className="stats-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton stat-skeleton" />
                    ))}
                </div>
                <div className="overview__panels">
                    <div className="skeleton panel-skeleton" />
                    <div className="skeleton panel-skeleton panel-skeleton--sm" />
                </div>
            </div>
        );
    }

    if (statusError) {
        return (
            <div className="overview">
                <div className="overview__error">
                    <span className="overview__error-icon">⚠️</span>
                    <h3>Failed to load dashboard</h3>
                    <p>{statusError}</p>
                    <p className="overview__error-hint">Make sure the server is running with <code>pm dashboard</code></p>
                </div>
            </div>
        );
    }

    if (!status) return null;

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
