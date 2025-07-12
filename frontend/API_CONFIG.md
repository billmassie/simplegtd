# API Configuration

This application uses environment variables to configure API endpoints, making it flexible for different deployment scenarios.

## Environment Variables

### `VITE_API_BASE_URL`

The base URL for the backend API. This can be configured for different environments:

#### Development (Local)
```bash
VITE_API_BASE_URL=http://localhost:8000
```

#### Production (Separate Backend)
```bash
VITE_API_BASE_URL=https://your-railway-app.railway.app
```

#### Same Domain (Frontend and Backend on Same Server)
```bash
VITE_API_BASE_URL=
# or
VITE_API_BASE_URL=/
```

## Setup Instructions

### 1. Development Setup
1. Copy `env.example` to `.env.development`
2. Ensure `VITE_API_BASE_URL=http://localhost:8000` is set
3. Start your backend server on port 8000
4. Start the frontend with `npm run dev`

### 2. Production Setup
1. Create a `.env.production` file
2. Set `VITE_API_BASE_URL` to your production backend URL
3. Build the frontend with `npm run build`

### 3. Railway Deployment
1. Set the environment variable in Railway dashboard
2. Use your Railway app URL: `https://your-app.railway.app`

## How It Works

The application uses a centralized API configuration in `src/config/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    TASKS: `${API_BASE_URL}/api/tasks.php`,
    COMPLETED_STEPS: `${API_BASE_URL}/api/completed_steps.php`,
};
```

All components import and use these endpoints, ensuring consistency across the application.

## Benefits

- ✅ **No hard-coded URLs** in components
- ✅ **Environment-specific configuration**
- ✅ **Easy deployment to different environments**
- ✅ **Centralized API management**
- ✅ **Fallback to localhost for development** 