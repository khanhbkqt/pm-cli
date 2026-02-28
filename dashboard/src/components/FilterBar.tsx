import type { Agent } from '../api/types';
import './FilterBar.css';

interface FilterBarProps {
    statusFilter: string;
    priorityFilter: string;
    agentFilter: string;
    viewMode: 'kanban' | 'list';
    agents: Agent[];
    onStatusChange: (status: string) => void;
    onPriorityChange: (priority: string) => void;
    onAgentChange: (agent: string) => void;
    onViewModeChange: (mode: 'kanban' | 'list') => void;
    onCreateClick: () => void;
}

const STATUS_OPTIONS = ['all', 'todo', 'in-progress', 'done', 'blocked'];
const PRIORITY_OPTIONS = ['all', 'urgent', 'high', 'medium', 'low'];

const statusLabels: Record<string, string> = {
    all: 'All',
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
};

const priorityLabels: Record<string, string> = {
    all: 'All',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

export function FilterBar({
    statusFilter,
    priorityFilter,
    agentFilter,
    viewMode,
    agents,
    onStatusChange,
    onPriorityChange,
    onAgentChange,
    onViewModeChange,
    onCreateClick,
}: FilterBarProps) {
    return (
        <div className="filter-bar">
            <div className="filter-bar__left">
                <div className="filter-bar__group">
                    <label className="filter-bar__label">Status</label>
                    <div className="filter-bar__pills">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s}
                                className={`filter-bar__btn ${statusFilter === s ? 'filter-bar__btn--active' : ''}`}
                                onClick={() => onStatusChange(s)}
                            >
                                {statusLabels[s]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-bar__group">
                    <label className="filter-bar__label">Priority</label>
                    <select
                        className="filter-bar__select"
                        value={priorityFilter}
                        onChange={(e) => onPriorityChange(e.target.value)}
                    >
                        {PRIORITY_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                                {priorityLabels[p]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-bar__group">
                    <label className="filter-bar__label">Agent</label>
                    <select
                        className="filter-bar__select"
                        value={agentFilter}
                        onChange={(e) => onAgentChange(e.target.value)}
                    >
                        <option value="all">All Agents</option>
                        {agents.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-bar__right">
                <div className="filter-bar__toggle">
                    <button
                        className={`filter-bar__view-btn ${viewMode === 'kanban' ? 'filter-bar__view-btn--active' : ''}`}
                        onClick={() => onViewModeChange('kanban')}
                        title="Kanban view"
                    >
                        ⊞
                    </button>
                    <button
                        className={`filter-bar__view-btn ${viewMode === 'list' ? 'filter-bar__view-btn--active' : ''}`}
                        onClick={() => onViewModeChange('list')}
                        title="List view"
                    >
                        ☰
                    </button>
                </div>
                <button className="filter-bar__create-btn" onClick={onCreateClick}>
                    + New Task
                </button>
            </div>
        </div>
    );
}
