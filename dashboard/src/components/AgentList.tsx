import type { Agent } from '../api';
import { getInitials, hashColor, relativeTime } from '../utils';
import './AgentList.css';

interface AgentListProps {
    agents: Agent[];
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
