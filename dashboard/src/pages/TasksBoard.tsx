import { useState, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { fetchTasks, fetchAgents, updateTask } from '../api/client';
import type { Task } from '../api/types';
import { FilterBar } from '../components/FilterBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { ListView } from '../components/ListView';
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import './TasksBoard.css';

export function TasksBoard() {
    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    // CRUD state
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Data fetching
    const fetchTasksCb = useCallback(() => fetchTasks(), []);
    const fetchAgentsCb = useCallback(() => fetchAgents(), []);
    const { data: tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useApi(fetchTasksCb);
    const { data: agents, loading: agentsLoading } = useApi(fetchAgentsCb);

    // Client-side filtering
    const filteredTasks = (tasks || []).filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (agentFilter !== 'all' && t.assigned_to !== agentFilter) return false;
        return true;
    });

    // Drag-and-drop status change
    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            await updateTask(taskId, { status: newStatus });
            refetchTasks();
        } catch (err) {
            console.error('Failed to update task status:', err);
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

    const handleTaskUpdate = () => {
        setSelectedTask(null);
        refetchTasks();
    };

    const handleTaskCreated = () => {
        refetchTasks();
    };

    if (tasksLoading || agentsLoading) {
        return (
            <div className="tasks-board">
                <LoadingSpinner message="Loading tasks..." />
            </div>
        );
    }

    if (tasksError) {
        return (
            <div className="tasks-board">
                <ErrorMessage message={tasksError} onRetry={refetchTasks} />
            </div>
        );
    }

    return (
        <div className="tasks-board">
            <FilterBar
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                agentFilter={agentFilter}
                viewMode={viewMode}
                agents={agents || []}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
                onAgentChange={setAgentFilter}
                onViewModeChange={setViewMode}
                onCreateClick={() => setShowCreateModal(true)}
            />

            {filteredTasks.length === 0 && (
                <EmptyState
                    icon="📋"
                    title="No tasks found"
                    description={tasks?.length === 0
                        ? 'Create your first task to get started.'
                        : 'Try adjusting the filters.'}
                    action={tasks?.length === 0 ? {
                        label: 'Create Task',
                        onClick: () => setShowCreateModal(true),
                    } : undefined}
                />
            )}

            {filteredTasks.length > 0 && viewMode === 'kanban' && (
                <KanbanBoard
                    tasks={filteredTasks}
                    onTaskClick={handleTaskClick}
                    onStatusChange={handleStatusChange}
                />
            )}

            {filteredTasks.length > 0 && viewMode === 'list' && (
                <ListView tasks={filteredTasks} onTaskClick={handleTaskClick} />
            )}

            {selectedTask && (
                <TaskDetailPanel
                    task={selectedTask}
                    agents={agents || []}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={handleTaskUpdate}
                />
            )}

            {showCreateModal && (
                <CreateTaskModal
                    agents={agents || []}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleTaskCreated}
                />
            )}
        </div>
    );
}
