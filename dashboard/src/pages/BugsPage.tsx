import { useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { fetchBugs, fetchBugById, reportBugApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { relativeTime } from '../utils';
import type { Bug } from '../api/types';
import './BugsPage.css';

const PRIORITY_ICONS: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
};

function formatLabel(s: string): string {
    return s.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const PRIORITY_FILTERS = ['all', 'critical', 'high', 'medium', 'low'] as const;
const STATUS_FILTERS = ['all', 'open', 'investigating', 'fixing', 'resolved', 'closed'] as const;

export function BugsPage() {
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const filters: Record<string, string> = {};
    if (priorityFilter !== 'all') filters.priority = priorityFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;

    const { data: bugs, loading, error, refetch } = useApi(
        useCallback(() => fetchBugs(Object.keys(filters).length > 0 ? filters : undefined), [priorityFilter, statusFilter])
    );

    const handleRowClick = async (bugId: string) => {
        setDetailLoading(true);
        try {
            const bug = await fetchBugById(bugId);
            setSelectedBug(bug);
        } catch {
            // ignore
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bugs-page">
                <LoadingSpinner message="Loading bugs..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bugs-page">
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    const allBugs = bugs || [];

    return (
        <div className="bugs-page">
            <div className="bugs-page__header">
                <span className="bugs-page__title">Bugs</span>
                <span className="bugs-page__subtitle">
                    {allBugs.length} bug{allBugs.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="bugs-page__toolbar">
                <div className="bugs-page__filter-group">
                    {PRIORITY_FILTERS.map(p => (
                        <button
                            key={p}
                            className={`bugs-page__filter-btn${priorityFilter === p ? ' bugs-page__filter-btn--active' : ''}`}
                            onClick={() => setPriorityFilter(p)}
                        >
                            {p === 'all' ? 'All' : `${PRIORITY_ICONS[p]} ${formatLabel(p)}`}
                        </button>
                    ))}
                </div>
                <div className="bugs-page__filter-group">
                    {STATUS_FILTERS.map(s => (
                        <button
                            key={s}
                            className={`bugs-page__filter-btn${statusFilter === s ? ' bugs-page__filter-btn--active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {formatLabel(s)}
                        </button>
                    ))}
                </div>
                <button
                    className="bugs-page__report-btn"
                    onClick={() => setShowReportModal(true)}
                >
                    🐛 Report Bug
                </button>
            </div>

            {allBugs.length === 0 ? (
                <EmptyState
                    icon="🐛"
                    title="No bugs found"
                    description="No bugs match the current filters."
                />
            ) : (
                <table className="bugs-table">
                    <thead>
                        <tr>
                            <th>Priority</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Blocking</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allBugs.map((bug: Bug) => (
                            <tr key={bug.id} onClick={() => handleRowClick(bug.id)}>
                                <td>
                                    <span className={`bugs-priority bugs-priority--${bug.priority}`}>
                                        {PRIORITY_ICONS[bug.priority]} {formatLabel(bug.priority)}
                                    </span>
                                </td>
                                <td className="bugs-table__title-cell">{bug.title}</td>
                                <td>
                                    <span className={`bugs-status bugs-status--${bug.status}`}>
                                        {formatLabel(bug.status)}
                                    </span>
                                </td>
                                <td>
                                    {bug.blocking ? (
                                        <span className="bugs-blocking">⚠ Blocking</span>
                                    ) : '—'}
                                </td>
                                <td>{relativeTime(bug.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Detail Panel */}
            {selectedBug && (
                <div className="bugs-detail-overlay" onClick={() => setSelectedBug(null)}>
                    <div className="bugs-detail" onClick={e => e.stopPropagation()}>
                        <div className="bugs-detail__header">
                            <span className="bugs-detail__title">{selectedBug.title}</span>
                            <button className="bugs-detail__close" onClick={() => setSelectedBug(null)}>✕</button>
                        </div>
                        <div className="bugs-detail__meta">
                            <div className="bugs-detail__meta-item">
                                <span className="bugs-detail__meta-label">Priority</span>
                                <span className={`bugs-priority bugs-priority--${selectedBug.priority}`}>
                                    {PRIORITY_ICONS[selectedBug.priority]} {formatLabel(selectedBug.priority)}
                                </span>
                            </div>
                            <div className="bugs-detail__meta-item">
                                <span className="bugs-detail__meta-label">Status</span>
                                <span className={`bugs-status bugs-status--${selectedBug.status}`}>
                                    {formatLabel(selectedBug.status)}
                                </span>
                            </div>
                            <div className="bugs-detail__meta-item">
                                <span className="bugs-detail__meta-label">Reported by</span>
                                <span className="bugs-detail__meta-value">{selectedBug.reported_by}</span>
                            </div>
                            {selectedBug.assigned_to && (
                                <div className="bugs-detail__meta-item">
                                    <span className="bugs-detail__meta-label">Assigned to</span>
                                    <span className="bugs-detail__meta-value">{selectedBug.assigned_to}</span>
                                </div>
                            )}
                            {selectedBug.blocking ? (
                                <div className="bugs-detail__meta-item">
                                    <span className="bugs-detail__meta-label">⚠</span>
                                    <span className="bugs-blocking">Blocking</span>
                                </div>
                            ) : null}
                        </div>
                        <div className="bugs-detail__content">
                            {detailLoading ? (
                                <LoadingSpinner message="Loading content..." />
                            ) : selectedBug.content ? (
                                selectedBug.content
                            ) : (
                                <span className="bugs-detail__no-content">No detailed content available.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <ReportBugModal
                    onClose={() => setShowReportModal(false)}
                    onSubmit={() => {
                        setShowReportModal(false);
                        refetch();
                    }}
                />
            )}
        </div>
    );
}

/* ─── Report Bug Modal ─────────────────────────────── */
function ReportBugModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [reportedBy, setReportedBy] = useState('');
    const [blocking, setBlocking] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !reportedBy.trim()) return;
        setSubmitting(true);
        try {
            await reportBugApi({
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                reported_by: reportedBy.trim(),
                blocking,
            });
            onSubmit();
        } catch {
            // ignore
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bugs-modal-overlay" onClick={onClose}>
            <div className="bugs-modal" onClick={e => e.stopPropagation()}>
                <div className="bugs-modal__title">🐛 Report Bug</div>
                <div className="bugs-modal__field">
                    <label className="bugs-modal__label">Title *</label>
                    <input
                        className="bugs-modal__input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Brief bug title"
                        autoFocus
                    />
                </div>
                <div className="bugs-modal__field">
                    <label className="bugs-modal__label">Description</label>
                    <textarea
                        className="bugs-modal__textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="What happened? Steps to reproduce?"
                    />
                </div>
                <div className="bugs-modal__field">
                    <label className="bugs-modal__label">Priority</label>
                    <select
                        className="bugs-modal__select"
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                    >
                        <option value="critical">🔴 Critical</option>
                        <option value="high">🟠 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                </div>
                <div className="bugs-modal__field">
                    <label className="bugs-modal__label">Reported by *</label>
                    <input
                        className="bugs-modal__input"
                        value={reportedBy}
                        onChange={e => setReportedBy(e.target.value)}
                        placeholder="Your name or agent ID"
                    />
                </div>
                <div className="bugs-modal__checkbox-row">
                    <input
                        type="checkbox"
                        id="blocking-check"
                        checked={blocking}
                        onChange={e => setBlocking(e.target.checked)}
                    />
                    <label htmlFor="blocking-check">This bug is blocking progress</label>
                </div>
                <div className="bugs-modal__actions">
                    <button className="bugs-modal__cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="bugs-modal__submit"
                        onClick={handleSubmit}
                        disabled={!title.trim() || !reportedBy.trim() || submitting}
                    >
                        {submitting ? 'Reporting…' : 'Report Bug'}
                    </button>
                </div>
            </div>
        </div>
    );
}
