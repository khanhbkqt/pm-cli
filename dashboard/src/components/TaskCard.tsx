import type { Task } from '../api/types';
import './TaskCard.css';

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

const priorityLabels: Record<string, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', String(task.id));
        e.dataTransfer.effectAllowed = 'move';
    };

    const date = new Date(task.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    return (
        <div
            className={`task-card task-card--${task.priority}`}
            draggable
            onDragStart={handleDragStart}
            onClick={() => onClick(task)}
        >
            <div className="task-card__header">
                <span className={`task-card__priority task-card__priority--${task.priority}`}>
                    {priorityLabels[task.priority] || task.priority}
                </span>
            </div>
            <h4 className="task-card__title">{task.title}</h4>
            <div className="task-card__meta">
                {task.assigned_to && (
                    <span className="task-card__assignee" title={task.assigned_to}>
                        👤 {task.assigned_to}
                    </span>
                )}
                <span className="task-card__date">{date}</span>
            </div>
        </div>
    );
}
