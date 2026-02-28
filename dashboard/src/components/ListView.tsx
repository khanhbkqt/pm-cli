import { useState } from 'react';
import type { Task } from '../api/types';
import './ListView.css';

interface ListViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

type SortKey = 'id' | 'title' | 'status' | 'priority' | 'assigned_to' | 'updated_at';
type SortDir = 'asc' | 'desc';

const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
};

const statusLabels: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
};

export function ListView({ tasks, onTaskClick }: ListViewProps) {
    const [sortKey, setSortKey] = useState<SortKey>('updated_at');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const sorted = [...tasks].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        switch (sortKey) {
            case 'id':
                return (a.id - b.id) * dir;
            case 'title':
                return a.title.localeCompare(b.title) * dir;
            case 'status':
                return a.status.localeCompare(b.status) * dir;
            case 'priority':
                return ((priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)) * dir;
            case 'assigned_to':
                return (a.assigned_to || '').localeCompare(b.assigned_to || '') * dir;
            case 'updated_at':
                return a.updated_at.localeCompare(b.updated_at) * dir;
            default:
                return 0;
        }
    });

    const sortIndicator = (key: SortKey) => {
        if (sortKey !== key) return '';
        return sortDir === 'asc' ? ' ↑' : ' ↓';
    };

    return (
        <div className="list-view">
            <table className="list-view__table">
                <thead>
                    <tr>
                        <th className="list-view__th" onClick={() => toggleSort('id')}>
                            #{sortIndicator('id')}
                        </th>
                        <th className="list-view__th list-view__th--title" onClick={() => toggleSort('title')}>
                            Title{sortIndicator('title')}
                        </th>
                        <th className="list-view__th" onClick={() => toggleSort('status')}>
                            Status{sortIndicator('status')}
                        </th>
                        <th className="list-view__th" onClick={() => toggleSort('priority')}>
                            Priority{sortIndicator('priority')}
                        </th>
                        <th className="list-view__th" onClick={() => toggleSort('assigned_to')}>
                            Assigned{sortIndicator('assigned_to')}
                        </th>
                        <th className="list-view__th" onClick={() => toggleSort('updated_at')}>
                            Updated{sortIndicator('updated_at')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((task) => (
                        <tr
                            key={task.id}
                            className="list-view__row"
                            onClick={() => onTaskClick(task)}
                        >
                            <td className="list-view__td list-view__td--id">{task.id}</td>
                            <td className="list-view__td list-view__td--title">{task.title}</td>
                            <td className="list-view__td">
                                <span className={`list-view__badge list-view__badge--${task.status}`}>
                                    {statusLabels[task.status] || task.status}
                                </span>
                            </td>
                            <td className="list-view__td">
                                <span className={`list-view__badge list-view__badge--${task.priority}`}>
                                    {task.priority}
                                </span>
                            </td>
                            <td className="list-view__td list-view__td--agent">
                                {task.assigned_to || '—'}
                            </td>
                            <td className="list-view__td list-view__td--date">
                                {new Date(task.updated_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
