import { useState, useEffect } from 'react';
import type { Agent } from '../api/types';
import { fetchAgentById } from '../api/client';
import { getInitials, hashColor } from '../utils';
import './AgentDetailPanel.css';

interface AgentDetailPanelProps {
    agentId: string | null;
    onClose: () => void;
}

export function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!agentId) {
            setAgent(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchAgentById(agentId)
            .then((agentData) => {
                if (!cancelled) {
                    setAgent(agentData);
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


                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}
