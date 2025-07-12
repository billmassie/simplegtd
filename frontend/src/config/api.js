// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_ENDPOINTS = {
    TASKS: `${API_BASE_URL}/api/tasks.php`,
    COMPLETED_STEPS: `${API_BASE_URL}/api/completed_steps.php`,
};

export default API_BASE_URL; 