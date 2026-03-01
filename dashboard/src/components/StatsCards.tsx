import { useEffect, useRef } from 'react';
import type { StatusResponse } from '../api';
import './StatsCards.css';

interface StatsCardsProps {
    status: StatusResponse;
}

function AnimatedCount({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const duration = 600;
        const start = performance.now();
        const from = 0;

        function step(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (value - from) * eased);
            if (el) el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }, [value]);

    return <span ref={ref}>0</span>;
}

function StatusBar({ byStatus }: { byStatus: Record<string, number> }) {
    const total = Object.values(byStatus).reduce((s, n) => s + n, 0);
    if (total === 0) return null;

    const segments = [
        { key: 'completed', color: 'var(--accent-green)', value: byStatus.completed ?? 0 },
        { key: 'in_progress', color: 'var(--accent-blue)', value: byStatus.in_progress ?? 0 },
        { key: 'pending', color: 'var(--text-secondary)', value: byStatus.pending ?? 0 },
        { key: 'failed', color: 'var(--accent-red)', value: byStatus.failed ?? 0 },
    ];

    return (
        <div className="status-bar" title={segments.map(s => `${s.key}: ${s.value}`).join(', ')}>
            {segments.map((seg) =>
                seg.value > 0 ? (
                    <div
                        key={seg.key}
                        className="status-bar__segment"
                        style={{
                            width: `${(seg.value / total) * 100}%`,
                            background: seg.color,
                        }}
                    />
                ) : null,
            )}
        </div>
    );
}

export function StatsCards({ status }: StatsCardsProps) {
    return (
        <div className="stats-grid">
            <div className="stat-card stat-card--plans">
                <div className="stat-card__icon">📋</div>
                <div className="stat-card__body">
                    <div className="stat-card__value">
                        <AnimatedCount value={status.plans.total} />
                    </div>
                    <div className="stat-card__label">Total Plans</div>
                    <StatusBar byStatus={status.plans.by_status} />
                </div>
            </div>

            <div className="stat-card stat-card--progress">
                <div className="stat-card__icon">🔄</div>
                <div className="stat-card__body">
                    <div className="stat-card__value">
                        <AnimatedCount value={status.plans.by_status.in_progress ?? 0} />
                    </div>
                    <div className="stat-card__label">In Progress</div>
                </div>
            </div>

            <div className="stat-card stat-card--agents">
                <div className="stat-card__icon">👥</div>
                <div className="stat-card__body">
                    <div className="stat-card__value">
                        <AnimatedCount value={status.agents.total} />
                    </div>
                    <div className="stat-card__label">Agents</div>
                    <div className="stat-card__meta">
                        {status.agents.by_type.human ?? 0} human · {status.agents.by_type.ai ?? 0} AI
                    </div>
                </div>
            </div>

            <div className="stat-card stat-card--context">
                <div className="stat-card__icon">📦</div>
                <div className="stat-card__body">
                    <div className="stat-card__value">
                        <AnimatedCount value={status.context.total} />
                    </div>
                    <div className="stat-card__label">Context Entries</div>
                </div>
            </div>
        </div>
    );
}
