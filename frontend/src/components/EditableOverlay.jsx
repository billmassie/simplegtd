import { useState, useEffect } from 'react';
import MarkdownText from './MarkdownText';
import { API_ENDPOINTS } from '../config/api';

function EditableOverlay({ isOpen, onClose, onSave, initialValue, fieldName, taskId }) {
    const [value, setValue] = useState(initialValue || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isMarkingDone, setIsMarkingDone] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        setValue(initialValue || '');
        setShowPreview(false);
    }, [initialValue]);

    const handleSave = async () => {
        if (value === initialValue) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(API_ENDPOINTS.TASKS, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: taskId,
                    [fieldName]: value
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask = await response.json();
            onSave(updatedTask);
            onClose();
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleMarkDone = async () => {
        if (!value.trim()) {
            alert('No content to mark as done');
            return;
        }

        setIsMarkingDone(true);
        try {
            // First, add the step to completed_steps
            const stepResponse = await fetch(API_ENDPOINTS.COMPLETED_STEPS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: taskId,
                    description: value.trim()
                }),
            });

            if (!stepResponse.ok) {
                throw new Error('Failed to add completed step');
            }

            // Then, clear the next_step field
            const taskResponse = await fetch(API_ENDPOINTS.TASKS, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: taskId,
                    next_step: null
                }),
            });

            if (!taskResponse.ok) {
                throw new Error('Failed to clear next step');
            }

            const updatedTask = await taskResponse.json();
            onSave(updatedTask);
            
            // Clear the text field and keep overlay open
            setValue('');
            setShowPreview(false); // Reset preview mode if it was active
            
        } catch (error) {
            console.error('Error marking step as done:', error);
            alert('Failed to mark step as done');
        } finally {
            setIsMarkingDone(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.metaKey) {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handlePaste = (e) => {
        const textarea = e.target;
        const selectedText = textarea.value.substring(
            textarea.selectionStart,
            textarea.selectionEnd
        );

        // Only process if there's selected text
        if (!selectedText) {
            return; // Let default paste behavior happen
        }

        // Get the pasted content
        const pastedText = e.clipboardData.getData('text');
        
        // Check if pasted content looks like a URL
        const urlPattern = /^(https?:\/\/|www\.)[^\s]+$/i;
        if (!urlPattern.test(pastedText.trim())) {
            return; // Let default paste behavior happen
        }

        // Prevent default paste behavior
        e.preventDefault();

        // Create markdown link
        const markdownLink = `[${selectedText}](${pastedText.trim()})`;

        // Replace selected text with markdown link
        const newValue = 
            textarea.value.substring(0, textarea.selectionStart) +
            markdownLink +
            textarea.value.substring(textarea.selectionEnd);

        setValue(newValue);

        // Set cursor position after the inserted link
        setTimeout(() => {
            const newCursorPos = textarea.selectionStart + markdownLink.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

    if (!isOpen) return null;

    return (
        <div className="overlay-backdrop" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <div className="overlay-header">
                    <h3>Edit {fieldName.replace('_', ' ')}</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="overlay-body">
                    {fieldName === 'priority' ? (
                        <select
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="edit-select"
                            autoFocus
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    ) : fieldName === 'title' ? (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter task title..."
                            autoFocus
                            className="edit-input"
                        />
                    ) : (fieldName === 'milestones' || fieldName === 'next_step') ? (
                        <div className="markdown-editor">
                            <div className="markdown-toolbar">
                                <button 
                                    type="button"
                                    className={`toolbar-button ${!showPreview ? 'active' : ''}`}
                                    onClick={() => setShowPreview(false)}
                                >
                                    Edit
                                </button>
                                <button 
                                    type="button"
                                    className={`toolbar-button ${showPreview ? 'active' : ''}`}
                                    onClick={() => setShowPreview(true)}
                                >
                                    Preview
                                </button>
                            </div>
                            {showPreview ? (
                                <div className="markdown-preview">
                                    <MarkdownText text={value} />
                                </div>
                            ) : (
                                <div className="markdown-input-container">
                                    <textarea
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onPaste={handlePaste}
                                        placeholder={`Enter ${fieldName.replace('_', ' ')}...\n\nMarkdown supported:\n• **bold** and *italic*\n• [links](url) - or select text and paste URL\n• - bullet lists\n• 1. numbered lists\n• # headings\n• \`code\` and \`\`\`code blocks\`\`\``}
                                        autoFocus
                                        rows={12}
                                        className="edit-textarea markdown-textarea"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            placeholder={`Enter ${fieldName.replace('_', ' ')}...`}
                            autoFocus
                            rows={6}
                            className="edit-textarea"
                        />
                    )}
                </div>
                <div className="overlay-footer">
                    <button 
                        className="cancel-button" 
                        onClick={onClose}
                        disabled={isSaving || isMarkingDone}
                    >
                        Cancel
                    </button>
                    {fieldName === 'next_step' && value.trim() && (
                        <button 
                            className="mark-done-button" 
                            onClick={handleMarkDone}
                            disabled={isSaving || isMarkingDone}
                        >
                            {isMarkingDone ? 'Marking Done...' : 'Mark Done'}
                        </button>
                    )}
                    <button 
                        className="save-button" 
                        onClick={handleSave}
                        disabled={isSaving || isMarkingDone}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <style>{`
                .overlay-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .overlay-content {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .overlay-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 20px 0 20px;
                    border-bottom: 1px solid #eee;
                    flex-shrink: 0;
                }
                .overlay-header h3 {
                    margin: 0;
                    color: #333;
                }
                .close-button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .close-button:hover {
                    color: #333;
                }
                .overlay-body {
                    padding: 20px;
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .edit-textarea {
                    width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 12px;
                    font-size: 14px;
                    font-family: inherit;
                    resize: vertical;
                    min-height: 100px;
                    max-height: 300px;
                    box-sizing: border-box;
                }
                .edit-textarea:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
                .edit-select {
                    width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 12px;
                    font-size: 16px;
                    font-family: inherit;
                    background-color: white;
                }
                .edit-select:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
                .edit-input {
                    width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 12px;
                    font-size: 16px;
                    font-family: inherit;
                    box-sizing: border-box;
                }
                .edit-input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }
                .overlay-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 0 20px 20px 20px;
                    flex-shrink: 0;
                }
                .cancel-button, .save-button, .mark-done-button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .cancel-button {
                    background: #f8f9fa;
                    color: #333;
                }
                .cancel-button:hover:not(:disabled) {
                    background: #e9ecef;
                }
                .save-button {
                    background: #007bff;
                    color: white;
                }
                .save-button:hover:not(:disabled) {
                    background: #0056b3;
                }
                .mark-done-button {
                    background: #28a745;
                    color: white;
                }
                .mark-done-button:hover:not(:disabled) {
                    background: #218838;
                }
                .cancel-button:disabled, .save-button:disabled, .mark-done-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .markdown-editor {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 0;
                }
                .markdown-toolbar {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                    flex-shrink: 0;
                }
                .toolbar-button {
                    padding: 5px 12px;
                    border: 1px solid #ddd;
                    background: #f8f9fa;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .toolbar-button.active {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }
                .toolbar-button:hover:not(.active) {
                    background: #e9ecef;
                }
                .markdown-preview {
                    flex: 1;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 12px;
                    background: #f8f9fa;
                    overflow-y: auto;
                    min-height: 0;
                    text-align: left;
                }
                .markdown-input-container {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }
                .markdown-textarea {
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    flex: 1;
                    min-height: 0;
                    resize: none;
                }
            `}</style>
        </div>
    );
}

export default EditableOverlay; 