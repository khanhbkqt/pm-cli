import { useState, useEffect, useCallback } from 'react';
import type { Task, Agent, TaskComment as TaskCommentType } from '../api/types';
import { updateTask, assignTask, fetchTaskComments, addTaskComment } from '../api/client';
import './TaskDetailPanel.css';

interface TaskDetailPanelProps {
    task: Task | null;
    agents: Agent[];
    onClose: () => void;
    onUpdate: () => void;
}

const STATUS_OPTIONS = ['todo', 'in-progress', 'done', 'blocked'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const statusLabels: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
};

export function TaskDetailPanel({ task, agents, onClose, onUpdate }: TaskDetailPanelProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [saving, setSaving] = useState(false);

    // Comments
    const [comments, setComments] = useState<TaskCommentType[]>([]);
    const [newCommentAgent, setNewCommentAgent] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [addingComment, setAddingComment] = useState(false);

    // Reset form when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setPriority(task.priority);
            setAssignedTo(task.assigned_to || '');
        }
    }, [task]);

    // Load comments
    const loadComments = useCallback(async () => {
        if (!task) return;
        try {
            const data = await fetchTaskComments(task.id);
            setComments(data);
        } catch {
            // silently handle — comments section shows empty
        }
    }, [task]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    if (!task) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTask(task.id, {
                title: title !== task.title ? title : undefined,
                description: description !== (task.description || '') ? description : undefined,
                status: status !== task.status ? status : undefined,
                priority: priority !== task.priority ? priority : undefined,
            });
            if (assignedTo !== (task.assigned_to || '')) {
                if (assignedTo) {
                    await assignTask(task.id, assignedTo);
                }
            }
            onUpdate();
        } catch (err) {
            console.error('Failed to save task:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleAddComment = async () => {
        if (!newCommentText.trim() || !newCommentAgent) return;
        setAddingComment(true);
        try {
            await addTaskComment(task.id, {
                agent_id: newCommentAgent,
                content: newCommentText.trim(),
            });
            setNewCommentText('');
            loadComments();
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setAddingComment(false);
        }
    };

    return (
        <>
            <div className="task-detail__overlay" onClick={onClose} />
            <div className="task-detail task-detail--open">
                <div className="task-detail__header">
                    <span className="task-detail__id">#{task.id}</span>
                    <button className="task-detail__close" onClick={onClose}>✕</button>
                </div>

                <div className="task-detail__body">
                    <div className="task-detail__field">
                        <label className="task-detail__label">Title</label>
                        <input
                            className="task-detail__input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="task-detail__field">
                        <label className="task-detail__label">Description</label>
                        <textarea
                            className="task-detail__textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Add a description…"
                        />
                    </div>

                    <div className="task-detail__row">
                        <div className="task-detail__field task-detail__field--half">
                            <label className="task-detail__label">Status</label>
                            <select
                                className="task-detail__select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {statusLabels[s] || s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="task-detail__field task-detail__field--half">
                            <label className="task-detail__label">Priority</label>
                            <select
                                className="task-detail__select"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                {PRIORITY_OPTIONS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="task-detail__field">
                        <label className="task-detail__label">Assigned To</label>
                        <select
                            className="task-detail__select"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Unassigned</option>
                            {agents.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="task-detail__save"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>

                    {/* Comments Section */}
                    <div className="task-detail__comments">
                        <h4 className="task-detail__comments-title">
                            Comments ({comments.length})
                        </h4>

                        <div className="task-detail__comments-list">
                            {comments.map((c) => (
                                <div key={c.id} className="task-detail__comment">
                                    <div className="task-detail__comment-header">
                                        <span className="task-detail__comment-agent">{c.agent_id}</span>
                                        <span className="task-detail__comment-date">
                                            {new Date(c.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <p className="task-detail__comment-body">{c.content}</p>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <p className="task-detail__no-comments">No comments yet</p>
                            )}
                        </div>

                        <div className="task-detail__add-comment">
                            <select
                                className="task-detail__select"
                                value={newCommentAgent}
                                onChange={(e) => setNewCommentAgent(e.target.value)}
                            >
                                <option value="">Select agent…</option>
                                {agents.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            <div className="task-detail__comment-input-row">
                                <input
                                    className="task-detail__input"
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Write a comment…"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button
                                    className="task-detail__comment-submit"
                                    onClick={handleAddComment}
                                    disabled={addingComment || !newCommentText.trim() || !newCommentAgent}
                                >
                                    {addingComment ? '…' : '↵'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
