import type { Agent } from '../api';
import './AgentList.css';

interface AgentListProps {
    agents: Agent[];
}

function getInitials(name: string): string {
    return name
        .split(/[\s-_]+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function hashColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = ((hash % 360) + 360) % 360;
    return `hsl(${hue}, 55%, 45%)`;
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

export function AgentList({ agents }: AgentListProps) {
    return (
        <div className="agent-list-panel">
            <h3 className="panel-title">Agents</h3>
            {agents.length === 0 ? (
                <div className="agent-list__empty">
                    <span className="agent-list__empty-icon">👤</span>
                    <p>No agents registered yet</p>
                </div>
            ) : (
                <div className="agent-list">
                    {agents.map((agent) => (
                        <div key={agent.id} className="agent-item">
                            <div
                                className="agent-item__avatar"
                                style={{ background: `linear-gradient(135deg, ${hashColor(agent.name)}, ${hashColor(agent.name + '2')})` }}
                            >
                                {getInitials(agent.name)}
                            </div>
                            <div className="agent-item__info">
                                <div className="agent-item__name">{agent.name}</div>
                                <div className="agent-item__role">{agent.role}</div>
                            </div>
                            <div className="agent-item__meta">
                                <span className={`agent-item__badge agent-item__badge--${agent.type}`}>
                                    {agent.type === 'ai' ? 'AI' : 'Human'}
                                </span>
                                <span className="agent-item__time">{relativeTime(agent.created_at)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
