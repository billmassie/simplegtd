import { useState, useEffect, useRef } from 'react'
import AddTask from './components/AddTask'
import EditableOverlay from './components/EditableOverlay'
import SingleTaskView from './components/SingleTaskView'
import FormattedText from './components/FormattedText'
import MarkdownText from './components/MarkdownText'
import { API_ENDPOINTS } from './config/api'
import './App.css'

function App() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [statusFilters, setStatusFilters] = useState({
        active: true,
        paused: false,
        done: false,
        cancelled: false
    });
    const [environment, setEnvironment] = useState('development');
    const [newlyAddedTaskId, setNewlyAddedTaskId] = useState(null);
    const taskRowRefs = useRef({});

    useEffect(() => {
        fetch('/api/environment.php')
            .then(res => res.json())
            .then(data => setEnvironment(data.environment || 'development'));
    }, []);

    useEffect(() => {
        if (environment === 'development') {
            document.title = "DEV: Bill's Amazing GTD...";
        } else {
            document.title = "Bill's Amazing GTD...";
        }
    }, [environment]);

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

    const fetchTasks = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.TASKS);
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const tasksData = await response.json();
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchTasks();
    }, []);

    const handleProjectChange = (projectId) => {
        setSelectedProjectId(projectId);
    };

    const handleTaskAdded = (newTask) => {
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setNewlyAddedTaskId(newTask.task_id);
        
        // Scroll to the new task after a short delay to ensure DOM is updated
        setTimeout(() => {
            const taskRow = taskRowRefs.current[newTask.task_id];
            if (taskRow) {
                taskRow.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Automatically open the next step overlay for the new task
                setEditingTask(newTask.task_id);
                setEditingField('next_step');
            }
        }, 100);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.task_id === updatedTask.task_id ? updatedTask : task
            )
        );
    };

    const handleEditField = (taskId, fieldName, currentValue) => {
        setEditingTask(taskId);
        setEditingField(fieldName);
    };

    const handleCloseEdit = () => {
        setEditingTask(null);
        setEditingField(null);
        // Clear the newly added task flag when closing overlay
        if (newlyAddedTaskId) {
            setNewlyAddedTaskId(null);
        }
    };

    const handleSaveEdit = (updatedTask) => {
        handleTaskUpdated(updatedTask);
    };

    const handleTaskClick = (taskId) => {
        setSelectedTaskId(taskId);
    };

    const handleBackToList = () => {
        setSelectedTaskId(null);
    };

    const handlePriorityChange = async (taskId, newPriority) => {
        try {
            const response = await fetch(API_ENDPOINTS.TASKS, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: taskId,
                    priority: newPriority
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update priority');
            }

            const updatedTask = await response.json();
            handleTaskUpdated(updatedTask);
        } catch (error) {
            console.error('Error updating priority:', error);
            alert('Failed to update priority');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await fetch(API_ENDPOINTS.TASKS, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: taskId,
                    status: newStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const updatedTask = await response.json();
            handleTaskUpdated(updatedTask);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilters(prev => ({
            ...prev,
            [status]: !prev[status]
        }));
    };

    // Filter tasks based on selected statuses and project
    const filteredTasks = tasks.filter(task => {
        const statusMatch = statusFilters[task.status];
        const projectMatch = !selectedProjectId || task.project_id === selectedProjectId;
        return statusMatch && projectMatch;
    });

    // Sort tasks by priority (high -> medium -> low)
    const sortedTasks = filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // If a task is selected, show the single task view
    if (selectedTaskId) {
        return (
            <SingleTaskView 
                taskId={selectedTaskId} 
                onBack={handleBackToList}
                onTaskUpdated={handleTaskUpdated}
            />
        );
    }

    // Helper function to set ref for task rows
    const setTaskRowRef = (taskId, element) => {
        if (element) {
            taskRowRefs.current[taskId] = element;
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>
                    {environment === 'development' ? (
                        <>
                            <span style={{ color: 'red' }}>DEV</span> Task List App
                        </>
                    ) : (
                        'Task List App'
                    )}
                </h1>
            </header>
            <AddTask onTaskAdded={handleTaskAdded} />
            
            {error && <div className="error">{error}</div>}
            
            <div className="status-filters">
                <h3>Show Tasks:</h3>
                <div className="filter-checkboxes">
                    <div className="project-label">Project</div>
                    <select 
                        className="project-select"
                        value={selectedProjectId || ''}
                        onChange={(e) => handleProjectChange(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                            <option key={project.project_id} value={project.project_id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={statusFilters.active}
                            onChange={() => handleStatusFilterChange('active')}
                        />
                        <span className="filter-label status-active">Active</span>
                    </label>
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={statusFilters.paused}
                            onChange={() => handleStatusFilterChange('paused')}
                        />
                        <span className="filter-label status-paused">Paused</span>
                    </label>
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={statusFilters.done}
                            onChange={() => handleStatusFilterChange('done')}
                        />
                        <span className="filter-label status-done">Done</span>
                    </label>
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={statusFilters.cancelled}
                            onChange={() => handleStatusFilterChange('cancelled')}
                        />
                        <span className="filter-label status-cancelled">Cancelled</span>
                    </label>
                </div>
            </div>
            
            <div className="tasks-list">
                <h2>Tasks</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Milestones</th>
                            <th>Next Step</th>
                            <th>Last Step</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.map(task => (
                            <tr 
                                key={task.task_id}
                                ref={(el) => setTaskRowRef(task.task_id, el)}
                                className={newlyAddedTaskId === task.task_id ? 'newly-added-task' : ''}
                            >
                                <td 
                                    className="task-id-cell"
                                    onClick={() => handleTaskClick(task.task_id)}
                                >
                                    {task.task_id}
                                </td>
                                <td 
                                    className="editable-cell"
                                    onClick={() => handleEditField(task.task_id, 'title', task.title)}
                                >
                                    {task.title}
                                </td>
                                <td className="editable-cell" onClick={() => handleEditField(task.task_id, 'milestones', task.milestones)}>
                                    {task.milestones ? (
                                        <div className="milestones-content">
                                            <MarkdownText text={task.milestones} />
                                        </div>
                                    ) : (
                                        <span className="placeholder">Click to add milestones...</span>
                                    )}
                                </td>
                                <td 
                                    className="editable-cell"
                                    onClick={() => handleEditField(task.task_id, 'next_step', task.next_step)}
                                >
                                    {task.next_step ? (
                                        <div className="next-step-content">
                                            <MarkdownText text={task.next_step} />
                                        </div>
                                    ) : (
                                        <span className="placeholder">Click to add next step...</span>
                                    )}
                                </td>
                                <td className="last-step-cell">
                                    {task.last_step_description ? (
                                        <div className="last-step-content">
                                            <div className="last-step-text">
                                                <MarkdownText text={task.last_step_description} />
                                            </div>
                                            <div className="last-step-date">
                                                {new Date(task.last_step_completed_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="placeholder">No completed steps</span>
                                    )}
                                </td>
                                <td 
                                    className={`priority-cell priority-${task.priority}`}
                                >
                                    <select
                                        value={task.priority}
                                        onChange={(e) => handlePriorityChange(task.task_id, e.target.value)}
                                        className="priority-select"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </td>
                                <td 
                                    className={`status-cell status-${task.status}`}
                                >
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.task_id, e.target.value)}
                                        className="status-select"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="done">Done</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EditableOverlay
                isOpen={editingTask !== null && editingField !== null}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
                initialValue={editingTask ? tasks.find(t => t.task_id === editingTask)?.[editingField] : ''}
                fieldName={editingField || ''}
                taskId={editingTask}
            />

            <style>{`
                .app {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .app-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .app-header h1 {
                    margin: 0;
                    font-size: 2.5em;
                    color: #333;
                }
                .tasks-list {
                    margin-top: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f4f4f4;
                }
                th:nth-child(2), td:nth-child(2) {
                    width: 200px;
                    max-width: 200px;
                }
                th:nth-child(3), td:nth-child(3),
                th:nth-child(4), td:nth-child(4),
                th:nth-child(5), td:nth-child(5) {
                    width: 350px;
                    max-width: 350px;
                }
                tr:nth-child(even) {
                    background-color: #f0f0f0;
                }
                .status-pending { color: #f39c12; }
                .status-in_progress { color: #3498db; }
                .status-completed { color: #2ecc71; }
                .error {
                    color: #dc3545;
                    margin: 10px 0;
                    padding: 10px;
                    background-color: #f8d7da;
                    border-radius: 4px;
                }
                .status-filters {
                    margin: 20px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                }
                .status-filters h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 16px;
                }
                .project-label {
                    text-align: right;
                    margin-bottom: 10px;
                    font-weight: bold;
                    color: #555;
                }
                .filter-checkboxes {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .project-label {
                    display: inline-block;
                    margin: 0;
                    padding: 0;
                    font-weight: bold;
                    color: #555;
                }
                .project-select {
                    padding: 4px 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    background: white;
                }
                .filter-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 5px 10px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                .filter-checkbox:hover {
                    background-color: #e9ecef;
                }
                .filter-checkbox input[type="checkbox"] {
                    margin: 0;
                    cursor: pointer;
                }
                .filter-label {
                    font-weight: bold;
                    text-transform: capitalize;
                }
                .status-active { color: #28a745; }
                .status-paused { color: #ffc107; }
                .status-done { color: #17a2b8; }
                .status-cancelled { color: #dc3545; }
                .task-id-cell {
                    cursor: pointer;
                    color: #007bff;
                    text-decoration: underline;
                    font-weight: bold;
                }
                .task-id-cell:hover {
                    color: #0056b3;
                }
                .priority-cell {
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: capitalize;
                    text-align: center;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                    padding: 0;
                }
                .priority-select {
                    width: 100%;
                    border: none;
                    background: transparent;
                    font-weight: bold;
                    text-transform: capitalize;
                    text-align: center;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    font-size: inherit;
                    font-family: inherit;
                }
                .priority-select:focus {
                    outline: none;
                    background-color: rgba(255, 255, 255, 0.8);
                }
                .priority-select option {
                    background: white;
                    color: #333;
                }
                .priority-cell:hover {
                    opacity: 0.8;
                }
                .priority-high {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                .priority-medium {
                    background-color: #fff3cd;
                    color: #856404;
                }
                .priority-low {
                    background-color: #d1ecf1;
                    color: #0c5460;
                }
                .status-cell {
                    padding: 0;
                }
                .status-select {
                    width: 100%;
                    border: none;
                    background: transparent;
                    font-weight: bold;
                    text-transform: capitalize;
                    text-align: center;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    font-size: inherit;
                    font-family: inherit;
                }
                .status-select:focus {
                    outline: none;
                    background-color: rgba(255, 255, 255, 0.8);
                }
                .status-select option {
                    background: white;
                    color: #333;
                }
                .editable-cell {
                    cursor: pointer;
                    background-color: transparent;
                    transition: background-color 0.2s;
                    vertical-align: top;
                }
                .editable-cell:hover {
                    background-color: #e9ecef;
                }
                tr:nth-child(even) .editable-cell {
                    background-color: #f0f0f0;
                }
                tr:nth-child(even) .editable-cell:hover {
                    background-color: #e9ecef;
                }
                .next-step-content {
                    word-wrap: break-word;
                    max-width: 330px;
                    max-height: 150px;
                    overflow-y: auto;
                }
                .last-step-cell {
                    vertical-align: top;
                }
                .last-step-content {
                    max-width: 330px;
                    max-height: 150px;
                    overflow-y: auto;
                }
                .last-step-text {
                    word-wrap: break-word;
                    margin-bottom: 4px;
                }
                .last-step-date {
                    font-size: 12px;
                    color: #666;
                    font-style: italic;
                }
                .placeholder {
                    color: #6c757d;
                    font-style: italic;
                }
                .text-link {
                    color: #007bff;
                    text-decoration: underline;
                }
                .text-link:hover {
                    color: #0056b3;
                    text-decoration: none;
                }
                .milestones-content {
                    max-width: 330px;
                    max-height: 150px;
                    overflow-y: auto;
                }
                .milestones-content .markdown-content {
                    font-size: 0.9em;
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
                .last-step-content .markdown-content {
                    font-size: 0.9em;
                    line-height: 1.4;
                }
                .last-step-content .markdown-content h1,
                .last-step-content .markdown-content h2,
                .last-step-content .markdown-content h3 {
                    margin: 0.2em 0;
                    font-size: 1em;
                }
                .last-step-content .markdown-content ul,
                .last-step-content .markdown-content ol {
                    margin: 0.2em 0;
                    padding-left: 1em;
                }
                .last-step-content .markdown-content li {
                    margin: 0.1em 0;
                }
                .newly-added-task {
                    animation: highlightNewTask 2s ease-out;
                    background-color: #d4edda !important;
                }
                @keyframes highlightNewTask {
                    0% {
                        background-color: #d4edda;
                        transform: scale(1.02);
                    }
                    50% {
                        background-color: #d4edda;
                        transform: scale(1.01);
                    }
                    100% {
                        background-color: inherit;
                        transform: scale(1);
                    }
                }
                tr:nth-child(even) .newly-added-task {
                    background-color: #d4edda !important;
                }
            `}</style>
        </div>
    );
}

export default App;
