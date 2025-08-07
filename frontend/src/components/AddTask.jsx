import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

function AddTask({ onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(API_ENDPOINTS.TASKS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, project_id: selectedProjectId }),
            });

            if (!response.ok) {
                throw new Error('Failed to add task');
            }

            const data = await response.json();
            setTitle(''); // Clear the input
            if (onTaskAdded) {
                onTaskAdded(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-task">
            <h2>Add New Task</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title"
                        disabled={isSubmitting}
                        className="task-input"
                    />
                    <select 
                        className="task-dropdown"
                        value={selectedProjectId || ''}
                        onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                            <option key={project.project_id} value={project.project_id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !title.trim() || !selectedProjectId}
                        className="submit-button"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
                {error && <div className="error-message">{error}</div>}
            </form>

            <style>{`
                .add-task {
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .form-group {
                    display: flex;
                    gap: 10px;
                }
                .task-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 16px;
                }
                .submit-button {
                    padding: 8px 16px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                .submit-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
                .submit-button:hover:not(:disabled) {
                    background-color: #0056b3;
                }
                .error-message {
                    color: #dc3545;
                    margin-top: 10px;
                }
                .task-dropdown {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 16px;
                    background: white;
                }
            `}</style>
        </div>
    );
}

export default AddTask; 