import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

function AddTask({ onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

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
                body: JSON.stringify({ title }),
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
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !title.trim()}
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
            `}</style>
        </div>
    );
}

export default AddTask; 