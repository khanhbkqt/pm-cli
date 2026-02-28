import { useState } from 'react';
import type { Agent } from '../api/types';
import { createTask } from '../api/client';
import './CreateTaskModal.css';

interface CreateTaskModalProps {
    agents: Agent[];
    onClose: () => void;
    onCreate: () => void;
}

export function CreateTaskModal({ agents, onClose, onCreate }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !createdBy) {
            setError('Title and Created By are required');
            return;
        }
        setCreating(true);
        setError('');
        try {
            await createTask({
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                assigned_to: assignedTo || undefined,
                created_by: createdBy,
            });
            onCreate();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <div className="create-modal__overlay" onClick={onClose} />
            <div className="create-modal">
                <div className="create-modal__header">
                    <h3 className="create-modal__title">Create New Task</h3>
                    <button className="create-modal__close" onClick={onClose}>✕</button>
                </div>

                <form className="create-modal__form" onSubmit={handleSubmit}>
                    <div className="create-modal__field">
                        <label className="create-modal__label">
                            Title <span className="create-modal__required">*</span>
                        </label>
                        <input
                            className="create-modal__input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title"
                            autoFocus
                        />
                    </div>

                    <div className="create-modal__field">
                        <label className="create-modal__label">Description</label>
                        <textarea
                            className="create-modal__textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description…"
                            rows={3}
                        />
                    </div>

                    <div className="create-modal__row">
                        <div className="create-modal__field create-modal__field--half">
                            <label className="create-modal__label">Priority</label>
                            <select
                                className="create-modal__select"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="create-modal__field create-modal__field--half">
                            <label className="create-modal__label">Assign To</label>
                            <select
                                className="create-modal__select"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {agents.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="create-modal__field">
                        <label className="create-modal__label">
                            Created By <span className="create-modal__required">*</span>
                        </label>
                        <select
                            className="create-modal__select"
                            value={createdBy}
                            onChange={(e) => setCreatedBy(e.target.value)}
                        >
                            <option value="">Select agent…</option>
                            {agents.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="create-modal__error">{error}</p>}

                    <div className="create-modal__actions">
                        <button
                            type="button"
                            className="create-modal__cancel"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="create-modal__submit"
                            disabled={creating}
                        >
                            {creating ? 'Creating…' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
