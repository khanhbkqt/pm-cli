import type { Task } from '../api';
import './ActivityFeed.css';

interface ActivityFeedProps {
    tasks: Task[];
}

const STATUS_COLORS: Record<string, string> = {
    todo: 'var(--text-secondary)',
    'in-progress': 'var(--accent-blue)',
    done: 'var(--accent-green)',
    blocked: 'var(--accent-red)',
};

const PRIORITY_COLORS: Record<string, string> = {
    low: 'var(--accent-green)',
    medium: 'var(--accent-orange)',
    high: '#ff7043',
    urgent: 'var(--accent-red)',
};

function formatStatus(status: string): string {
    return status
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export function ActivityFeed({ tasks }: ActivityFeedProps) {
    return (
        <div className="activity-panel">
            <h3 className="panel-title">Recent Activity</h3>
            {tasks.length === 0 ? (
                <div className="activity__empty">
                    <span className="activity__empty-icon">📝</span>
                    <p>No recent activity</p>
                </div>
            ) : (
                <div className="activity-feed">
                    {tasks.map((task) => (
                        <div key={task.id} className="activity-item">
                            <div className="activity-item__timeline">
                                <div
                                    className="activity-item__dot"
                                    style={{ background: STATUS_COLORS[task.status] ?? 'var(--text-secondary)' }}
                                />
                                <div className="activity-item__line" />
                            </div>
                            <div className="activity-item__content">
                                <div className="activity-item__header">
                                    <span
                                        className="activity-item__priority"
                                        style={{ background: PRIORITY_COLORS[task.priority] ?? 'var(--text-secondary)' }}
                                        title={`Priority: ${task.priority}`}
                                    />
                                    <span className="activity-item__title">{task.title}</span>
                                </div>
                                <div className="activity-item__footer">
                                    <span
                                        className="activity-item__status"
                                        style={{
                                            color: STATUS_COLORS[task.status] ?? 'var(--text-secondary)',
                                            background: `color-mix(in srgb, ${STATUS_COLORS[task.status] ?? 'var(--text-secondary)'} 12%, transparent)`,
                                        }}
                                    >
                                        {formatStatus(task.status)}
                                    </span>
                                    <span className="activity-item__time">{relativeTime(task.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
