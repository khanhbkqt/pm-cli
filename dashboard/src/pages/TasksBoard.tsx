import { useApi } from '../hooks/useApi';
import { fetchStatus } from '../api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import './TasksBoard.css';

const STATUS_COLORS: Record<string, string> = {
    pending: 'var(--text-secondary)',
    in_progress: 'var(--accent-blue)',
    completed: 'var(--accent-green)',
    failed: 'var(--accent-red)',
};

function formatStatus(s: string) {
    return s.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function TasksBoard() {
    const { data: status, loading, error, refetch } = useApi(fetchStatus);

    if (loading) {
        return (
            <div className="tasks-board">
                <LoadingSpinner message="Loading plans..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="tasks-board">
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    const plans = status?.recent_plans ?? [];

    if (plans.length === 0) {
        return (
            <div className="tasks-board">
                <EmptyState
                    icon="📋"
                    title="No plans found"
                    description="Run pm plan to create execution plans for a phase."
                />
            </div>
        );
    }

    // Group plans by status
    const columns: Array<{ key: string; label: string }> = [
        { key: 'pending', label: 'Pending' },
        { key: 'in_progress', label: 'In Progress' },
        { key: 'completed', label: 'Completed' },
        { key: 'failed', label: 'Failed' },
    ];

    return (
        <div className="tasks-board">
            <div className="board-header">
                <h2 className="board-title">Plans Board</h2>
                <span className="board-subtitle">{plans.length} recent plan{plans.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="kanban-board">
                {columns.map(col => {
                    const colPlans = plans.filter(p => p.status === col.key);
                    return (
                        <div key={col.key} className="kanban-column">
                            <div className="kanban-column__header">
                                <span
                                    className="kanban-column__dot"
                                    style={{ background: STATUS_COLORS[col.key] }}
                                />
                                <span className="kanban-column__title">{col.label}</span>
                                <span className="kanban-column__count">{colPlans.length}</span>
                            </div>
                            <div className="kanban-column__cards">
                                {colPlans.length === 0 ? (
                                    <div className="kanban-column__empty">No {col.label.toLowerCase()} plans</div>
                                ) : (
                                    colPlans.map(plan => (
                                        <div key={plan.id} className="task-card">
                                            <div className="task-card__title">{plan.name}</div>
                                            <div className="task-card__meta">
                                                <span
                                                    className="task-card__status"
                                                    style={{ color: STATUS_COLORS[plan.status] }}
                                                >
                                                    {formatStatus(plan.status)}
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
        </div>
    );
}
