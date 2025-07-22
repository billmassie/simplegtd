import { useState, useEffect } from 'react';
import EditableOverlay from './EditableOverlay';
import FormattedText from './FormattedText';
import MarkdownText from './MarkdownText';
import { API_ENDPOINTS } from '../config/api';

function SingleTaskView({ taskId, onBack, onTaskUpdated }) {
    const [task, setTask] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingField, setEditingField] = useState(null);

    useEffect(() => {
        fetchTaskData();
    }, [taskId]);

    const fetchTaskData = async () => {
        setLoading(true);
        try {
            // Fetch task details
            const taskResponse = await fetch(API_ENDPOINTS.TASKS);
            if (!taskResponse.ok) {
                throw new Error('Failed to fetch task');
            }
            const tasks = await taskResponse.json();
            const currentTask = tasks.find(t => t.task_id === taskId);
            if (!currentTask) {
                throw new Error('Task not found');
            }
            setTask(currentTask);

            // Fetch completed steps
            const stepsResponse = await fetch(API_ENDPOINTS.COMPLETED_STEPS);
            if (!stepsResponse.ok) {
                throw new Error('Failed to fetch completed steps');
            }
            const allSteps = await stepsResponse.json();
            const taskSteps = allSteps
                .filter(step => step.task_id === taskId)
                .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
            setCompletedSteps(taskSteps);

            setError(null);
        } catch (err) {
            setError('Failed to load task data: ' + err.message);
            console.error('Error fetching task data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditField = (fieldName, currentValue) => {
        setEditingField(fieldName);
    };

    const handleCloseEdit = () => {
        setEditingField(null);
    };

    const handleSaveEdit = (updatedTask) => {
        setTask(updatedTask);
        onTaskUpdated(updatedTask);
    };

    if (loading) {
        return (
            <div className="single-task-view">
                <div className="loading">Loading task...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="single-task-view">
                <div className="error">{error}</div>
                <button onClick={onBack} className="back-button">Back to List</button>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="single-task-view">
                <div className="error">Task not found</div>
                <button onClick={onBack} className="back-button">Back to List</button>
            </div>
        );
    }

    return (
        <div className="single-task-view">
            <div className="header">
                <button onClick={onBack} className="back-button">← Back to List</button>
                <h1>Task #{task.task_id}</h1>
            </div>

            <div className="task-details">
                <div className="task-section">
                    <h2>Task Information</h2>
                    <div className="task-grid">
                        <div className="task-field">
                            <label>Title:</label>
                            <div className="task-value">{task.title}</div>
                        </div>
                        <div className="task-field">
                            <label>Priority:</label>
                            <div 
                                className={`task-value priority-${task.priority}`}
                                onClick={() => handleEditField('priority', task.priority)}
                            >
                                {task.priority}
                            </div>
                        </div>
                        <div className="task-field">
                            <label>Status:</label>
                            <div className={`task-value status-${task.status}`}>{task.status}</div>
                        </div>
                        <div className="task-field">
                            <label>Created:</label>
                            <div className="task-value">{new Date(task.created_at).toLocaleString()}</div>
                        </div>
                        <div className="task-field">
                            <label>Updated:</label>
                            <div className="task-value">{new Date(task.updated_at).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="task-section">
                    <h2>Next Step</h2>
                    <div 
                        className="next-step-display"
                        onClick={() => handleEditField('next_step', task.next_step)}
                    >
                        {task.next_step ? (
                            <div className="next-step-content">
                                <FormattedText text={task.next_step} />
                            </div>
                        ) : (
                            <span className="placeholder">Click to add next step...</span>
                        )}
                    </div>
                </div>

                <div className="task-section">
                    <h2>Completed Steps ({completedSteps.length})</h2>
                    {completedSteps.length > 0 ? (
                        <div className="completed-steps">
                            {completedSteps.map((step, index) => (
                                <div key={step.completed_step_id} className="completed-step">
                                    <div className="step-header">
                                        <span className="step-number">#{completedSteps.length - index}</span>
                                        <span className="step-date">
                                            {new Date(step.completed_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="step-description">
                                        <FormattedText text={step.description} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-steps">No completed steps yet.</div>
                    )}
                </div>

                <div className="task-section">
                    <h2>Milestones</h2>
                    <div className="milestones-display" onClick={() => handleEditField('milestones', task.milestones)}>
                        {task.milestones ? (
                            <div className="milestones-content">
                                <MarkdownText text={task.milestones} />
                            </div>
                        ) : (
                            <span className="placeholder">Click to add milestones...</span>
                        )}
                    </div>
                </div>

                {/* Notes section */}
                <div className="task-section">
                    <h2>Notes</h2>
                    <div className="notes-display" onClick={() => handleEditField('notes', task.notes)}>
                        {task.notes ? (
                            <div className="notes-content">
                                <MarkdownText text={task.notes} />
                            </div>
                        ) : (
                            <span className="placeholder">Click to add notes...</span>
                        )}
                    </div>
                </div>
            </div>

            <EditableOverlay
                isOpen={editingField !== null}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
                initialValue={editingField ? task[editingField] : ''}
                fieldName={editingField || ''}
                taskId={taskId}
            />

            <style jsx>{`
                .single-task-view {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 20px;
                }
                .back-button {
                    padding: 8px 16px;
                    background: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .back-button:hover {
                    background: #5a6268;
                }
                .header h1 {
                    margin: 0;
                    color: #333;
                }
                .task-details {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }
                .task-section {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                }
                .task-section h2 {
                    margin: 0 0 15px 0;
                    color: #333;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 10px;
                }
                .task-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }
                .task-field {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .task-field label {
                    font-weight: bold;
                    color: #666;
                    font-size: 14px;
                }
                .task-value {
                    color: #333;
                }
                .priority-high {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .priority-medium {
                    background-color: #fff3cd;
                    color: #856404;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .priority-low {
                    background-color: #d1ecf1;
                    color: #0c5460;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .status-active { color: #28a745; }
                .status-paused { color: #ffc107; }
                .status-done { color: #17a2b8; }
                .status-cancelled { color: #dc3545; }
                .next-step-display {
                    cursor: pointer;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 15px;
                    transition: border-color 0.2s;
                }
                .next-step-display:hover {
                    border-color: #007bff;
                }
                .milestones-display {
                    cursor: pointer;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 15px;
                    transition: border-color 0.2s;
                }
                .milestones-display:hover {
                    border-color: #007bff;
                }
                .next-step-content {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .milestones-content {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .notes-display {
                    cursor: pointer;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 15px;
                    transition: border-color 0.2s;
                }
                .notes-display:hover {
                    border-color: #007bff;
                }
                .notes-content {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .placeholder {
                    color: #6c757d;
                    font-style: italic;
                }
                .completed-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .completed-step {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 15px;
                }
                .step-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #f8f9fa;
                }
                .step-number {
                    font-weight: bold;
                    color: #007bff;
                    background: #e7f3ff;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }
                .step-date {
                    color: #666;
                    font-size: 12px;
                }
                .step-description {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    color: #333;
                }
                .text-link {
                    color: #007bff;
                    text-decoration: underline;
                }
                .text-link:hover {
                    color: #0056b3;
                    text-decoration: none;
                }
                .no-steps {
                    color: #6c757d;
                    font-style: italic;
                    text-align: center;
                    padding: 20px;
                }
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }
                .error {
                    color: #dc3545;
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    border-radius: 4px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
            `}</style>
        </div>
    );
}

export default SingleTaskView; 