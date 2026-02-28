import { useState, useEffect } from 'react';
import type { Agent, Task } from '../api/types';
import { fetchAgentById, fetchTasks } from '../api/client';
import { getInitials, hashColor } from '../utils';
import './AgentDetailPanel.css';

interface AgentDetailPanelProps {
    agentId: string | null;
    onClose: () => void;
}

const statusLabels: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
};

export function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!agentId) {
            setAgent(null);
            setTasks([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all([
            fetchAgentById(agentId),
            fetchTasks({ assigned_to: agentId }),
        ])
            .then(([agentData, taskData]) => {
                if (!cancelled) {
                    setAgent(agentData);
                    setTasks(taskData);
                    setLoading(false);
                }
            })
            .catch((err: Error) => {
                if (!cancelled) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [agentId]);

    if (!agentId) return null;

    return (
        <>
            <div className="agent-detail__overlay" onClick={onClose} />
            <div className="agent-detail agent-detail--open">
                <div className="agent-detail__header">
                    <span className="agent-detail__label-text">Agent Details</span>
                    <button className="agent-detail__close" onClick={onClose}>✕</button>
                </div>

                <div className="agent-detail__body">
                    {loading ? (
                        <div className="agent-detail__loading">
                            <div className="agent-detail__avatar-lg skeleton" />
                            <div className="skeleton" style={{ width: '60%', height: 20, margin: '12px auto 0' }} />
                            <div className="skeleton" style={{ width: '40%', height: 14, margin: '8px auto 0' }} />
                        </div>
                    ) : error ? (
                        <div className="agent-detail__error">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    ) : agent ? (
                        <>
                            {/* Agent Profile */}
                            <div className="agent-detail__profile">
                                <div
                                    className="agent-detail__avatar-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${hashColor(agent.name)}, ${hashColor(agent.name + '2')})`,
                                    }}
                                >
                                    {getInitials(agent.name)}
                                </div>
                                <h3 className="agent-detail__name">{agent.name}</h3>
                                <p className="agent-detail__role">{agent.role}</p>
                                <span className={`agent-detail__badge agent-detail__badge--${agent.type}`}>
                                    {agent.type === 'ai' ? '🤖 AI Agent' : '👤 Human'}
                                </span>
                            </div>

                            {/* Metadata */}
                            <div className="agent-detail__meta-section">
                                <div className="agent-detail__meta-row">
                                    <span className="agent-detail__meta-label">ID</span>
                                    <span className="agent-detail__meta-value agent-detail__meta-value--mono">{agent.id}</span>
                                </div>
                                <div className="agent-detail__meta-row">
                                    <span className="agent-detail__meta-label">Registered</span>
                                    <span className="agent-detail__meta-value">
                                        {new Date(agent.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Assigned Tasks */}
                            <div className="agent-detail__tasks-section">
                                <h4 className="agent-detail__tasks-title">
                                    Assigned Tasks ({tasks.length})
                                </h4>
                                {tasks.length === 0 ? (
                                    <p className="agent-detail__no-tasks">No tasks assigned</p>
                                ) : (
                                    <div className="agent-detail__tasks-list">
                                        {tasks.map((t) => (
                                            <div key={t.id} className="agent-detail__task-item">
                                                <div className="agent-detail__task-title">
                                                    <span className="agent-detail__task-id">#{t.id}</span>
                                                    {t.title}
                                                </div>
                                                <div className="agent-detail__task-badges">
                                                    <span className={`agent-detail__status-badge agent-detail__status-badge--${t.status}`}>
                                                        {statusLabels[t.status] || t.status}
                                                    </span>
                                                    <span className={`agent-detail__priority-badge agent-detail__priority-badge--${t.priority}`}>
                                                        {t.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}
