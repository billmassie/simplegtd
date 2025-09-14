import { useState, useEffect } from 'react';
import EditableOverlay from './EditableOverlay';
import FormattedText from './FormattedText';
import MarkdownText from './MarkdownText';
import { API_ENDPOINTS } from '../config/api';

function SingleTaskView({ taskId, onBack, onTaskUpdated }) {
    const [task, setTask] = useState(null);
    const [projects, setProjects] = useState([]);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [milestonesExpanded, setMilestonesExpanded] = useState(true);
    const [notesExpanded, setNotesExpanded] = useState(true);
    const [nextStepExpanded, setNextStepExpanded] = useState(true);
    const [completedStepsExpanded, setCompletedStepsExpanded] = useState(true);

    useEffect(() => {
        fetchTaskData();
    }, [taskId]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects.php');
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const projectsData = await response.json();
            setProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchTaskData = async () => {
        setLoading(true);
        try {
            // Fetch projects first
            await fetchProjects();

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

    const handleProjectChange = async (newProjectId) => {
        try {
            const response = await fetch(API_ENDPOINTS.TASKS, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: taskId,
                    project_id: newProjectId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const updatedTask = await response.json();
            setTask(updatedTask);
            onTaskUpdated(updatedTask);
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project');
        }
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
                    <table className="task-info-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Project</th>
                                <th>Created</th>
                                <th>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="info-value">{task.title}</td>
                                <td className="info-value">
                                    <span 
                                        className={`priority-badge priority-${task.priority}`}
                                        onClick={() => handleEditField('priority', task.priority)}
                                    >
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="info-value">
                                    <span className={`status-badge status-${task.status}`}>{task.status}</span>
                                </td>
                                <td className="info-value">
                                    <select
                                        value={task.project_id || 1}
                                        onChange={(e) => handleProjectChange(parseInt(e.target.value))}
                                        className="project-select"
                                    >
                                        {projects.map(project => (
                                            <option key={project.project_id} value={project.project_id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="info-value">{new Date(task.created_at).toLocaleString()}</td>
                                <td className="info-value">{new Date(task.updated_at).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="task-section">
                    <h2 className="collapsible-header" onClick={() => setMilestonesExpanded(!milestonesExpanded)}>
                        <span className="collapse-icon">{milestonesExpanded ? '▼' : '▶'}</span>
                        Milestones
                    </h2>
                    {milestonesExpanded && (
                        <div className="milestones-display table-cell-style" onClick={() => handleEditField('milestones', task.milestones)}>
                            {task.milestones ? (
                                <div className="milestones-content">
                                    <MarkdownText text={task.milestones} />
                                </div>
                            ) : (
                                <span className="placeholder">Click to add milestones...</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="task-section">
                    <h2 className="collapsible-header" onClick={() => setNotesExpanded(!notesExpanded)}>
                        <span className="collapse-icon">{notesExpanded ? '▼' : '▶'}</span>
                        Notes
                    </h2>
                    {notesExpanded && (
                        <div className="notes-display table-cell-style" onClick={() => handleEditField('notes', task.notes)}>
                            {task.notes ? (
                                <div className="notes-content">
                                    <MarkdownText text={task.notes} />
                                </div>
                            ) : (
                                <span className="placeholder">Click to add notes...</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="task-section">
                    <h2 className="collapsible-header" onClick={() => setNextStepExpanded(!nextStepExpanded)}>
                        <span className="collapse-icon">{nextStepExpanded ? '▼' : '▶'}</span>
                        Next Step
                    </h2>
                    {nextStepExpanded && (
                        <div 
                            className="next-step-display table-cell-style"
                            onClick={() => handleEditField('next_step', task.next_step)}
                        >
                            {task.next_step ? (
                                <div className="next-step-content">
                                    <MarkdownText text={task.next_step} />
                                </div>
                            ) : (
                                <span className="placeholder">Click to add next step...</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="task-section">
                    <h2 className="collapsible-header" onClick={() => setCompletedStepsExpanded(!completedStepsExpanded)}>
                        <span className="collapse-icon">{completedStepsExpanded ? '▼' : '▶'}</span>
                        Completed Steps ({completedSteps.length})
                    </h2>
                    {completedStepsExpanded && (
                        <>
                            {completedSteps.length > 0 ? (
                                <div className="completed-steps table-cell-style">
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
                                <div className="no-steps table-cell-style">No completed steps yet.</div>
                            )}
                        </>
                    )}
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

            <style>{`
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
                .collapsible-header {
                    cursor: pointer;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.2s;
                }
                .collapsible-header:hover {
                    color: #007bff;
                }
                .collapse-icon {
                    font-size: 12px;
                    color: #666;
                    transition: color 0.2s;
                }
                .collapsible-header:hover .collapse-icon {
                    color: #007bff;
                }
                .task-info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    border: 1px solid #dee2e6;
                }
                .task-info-table th {
                    background-color: #f4f4f4;
                    padding: 12px 8px;
                    border-bottom: 1px solid #dee2e6;
                    border-right: 1px solid #dee2e6;
                    font-weight: bold;
                    color: #333;
                    font-size: 14px;
                    text-align: left;
                }
                .task-info-table th:last-child {
                    border-right: none;
                }
                .task-info-table td {
                    padding: 12px 8px;
                    border-bottom: 1px solid #dee2e6;
                    border-right: 1px solid #dee2e6;
                    vertical-align: middle;
                }
                .task-info-table td:last-child {
                    border-right: none;
                }
                .task-info-table tr:last-child td {
                    border-bottom: none;
                }
                .info-value {
                    color: #333;
                    font-size: 14px;
                }
                .priority-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    text-transform: capitalize;
                    cursor: pointer;
                    font-size: 12px;
                }
                .priority-badge.priority-high {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                .priority-badge.priority-medium {
                    background-color: #fff3cd;
                    color: #856404;
                }
                .priority-badge.priority-low {
                    background-color: #d1ecf1;
                    color: #0c5460;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                    text-transform: capitalize;
                    font-size: 12px;
                }
                .status-badge.status-active { 
                    color: #28a745; 
                    background-color: #d4edda;
                }
                .status-badge.status-paused { 
                    color: #856404; 
                    background-color: #fff3cd;
                }
                .status-badge.status-done { 
                    color: #0c5460; 
                    background-color: #d1ecf1;
                }
                .status-badge.status-cancelled { 
                    color: #721c24; 
                    background-color: #f8d7da;
                }
                .project-name {
                    background-color: #e9ecef;
                    color: #495057;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .project-select {
                    padding: 4px 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    background: white;
                    cursor: pointer;
                    width: 100%;
                    max-width: 150px;
                }
                .project-select:focus {
                    outline: none;
                    border-color: #007bff;
                }
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
                .next-step-display.table-cell-style {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 0;
                    background-color: transparent;
                    transition: background-color 0.2s;
                    vertical-align: top;
                    min-height: auto;
                }
                .next-step-display.table-cell-style:hover {
                    background-color: #e9ecef;
                    border-color: #ddd;
                }
                .table-cell-style {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 0;
                    background-color: transparent;
                    transition: background-color 0.2s;
                    vertical-align: top;
                    min-height: auto;
                }
                .table-cell-style:hover {
                    background-color: #e9ecef;
                    border-color: #ddd;
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
                    word-wrap: break-word;
                    text-align: left;
                }
                .next-step-content .markdown-content {
                    font-size: 0.9em;
                    line-height: 1.4;
                }
                .next-step-content .markdown-content h1,
                .next-step-content .markdown-content h2,
                .next-step-content .markdown-content h3 {
                    margin: 0.2em 0;
                    font-size: 1em;
                }
                .next-step-content .markdown-content ul,
                .next-step-content .markdown-content ol {
                    margin: 0.2em 0;
                    padding-left: 1em;
                }
                .next-step-content .markdown-content li {
                    margin: 0.1em 0;
                }
                .milestones-content {
                    max-height: 400px;
                    overflow-y: auto;
                    word-wrap: break-word;
                    text-align: left;
                }
                .milestones-content .markdown-content {
                    font-size: 0.9em;
                    line-height: 1.4;
                }
                .milestones-content .markdown-content h1,
                .milestones-content .markdown-content h2,
                .milestones-content .markdown-content h3 {
                    margin: 0.2em 0;
                    font-size: 1em;
                }
                .milestones-content .markdown-content ul,
                .milestones-content .markdown-content ol {
                    margin: 0.2em 0;
                    padding-left: 1em;
                }
                .milestones-content .markdown-content li {
                    margin: 0.1em 0;
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
                    word-wrap: break-word;
                    text-align: left;
                }
                .notes-content .markdown-content {
                    font-size: 0.9em;
                    line-height: 1.4;
                }
                .notes-content .markdown-content h1,
                .notes-content .markdown-content h2,
                .notes-content .markdown-content h3 {
                    margin: 0.2em 0;
                    font-size: 1em;
                }
                .notes-content .markdown-content ul,
                .notes-content .markdown-content ol {
                    margin: 0.2em 0;
                    padding-left: 1em;
                }
                .notes-content .markdown-content li {
                    margin: 0.1em 0;
                }
                .placeholder {
                    color: #6c757d;
                    font-style: italic;
                }
                .completed-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    word-wrap: break-word;
                    text-align: left;
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
                    text-align: left;
                    padding: 8px 12px;
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