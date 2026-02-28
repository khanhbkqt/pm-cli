import { useState } from 'react';
import type { Task } from '../api/types';
import { TaskCard } from './TaskCard';
import './KanbanBoard.css';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onStatusChange: (taskId: number, newStatus: string) => void;
}

const COLUMNS: { key: string; label: string }[] = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
    { key: 'blocked', label: 'Blocked' },
];

export function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);

    const tasksByStatus = COLUMNS.reduce<Record<string, Task[]>>((acc, col) => {
        acc[col.key] = tasks.filter((t) => t.status === col.key);
        return acc;
    }, {});

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverCol(status);
    };

    const handleDragLeave = () => {
        setDragOverCol(null);
    };

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        setDragOverCol(null);
        const taskId = Number(e.dataTransfer.getData('text/plain'));
        if (!isNaN(taskId)) {
            onStatusChange(taskId, newStatus);
        }
    };

    return (
        <div className="kanban">
            {COLUMNS.map((col) => (
                <div
                    key={col.key}
                    className={`kanban__column ${dragOverCol === col.key ? 'kanban__column--dragover' : ''}`}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.key)}
                >
                    <div className="kanban__header">
                        <span className="kanban__label">{col.label}</span>
                        <span className="kanban__count">{tasksByStatus[col.key]?.length || 0}</span>
                    </div>
                    <div className="kanban__cards">
                        {tasksByStatus[col.key]?.length === 0 && (
                            <p className="kanban__empty">No tasks</p>
                        )}
                        {tasksByStatus[col.key]?.map((task) => (
                            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
