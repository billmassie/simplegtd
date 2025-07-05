# Task List Application

A full-stack task management application with a React frontend and PHP backend API. Features include task creation, editing, status tracking, priority management, and markdown support for rich text content.

## Features

- **Task Management**: Create, edit, and delete tasks with title, description, status, and priority
- **Next Steps**: Track the current next step for each task with inline editing
- **Completed Steps**: Historical tracking of completed steps for each task
- **Milestones**: Rich milestone tracking with full markdown support
- **Status Filtering**: Filter tasks by status (active, completed, etc.)
- **Priority Sorting**: Automatic sorting by priority (High, Medium, Low)
- **Markdown Support**: Full markdown rendering for descriptions, next steps, and milestones
- **Clickable Links**: Support for both markdown-style links and plain URLs
- **Responsive Design**: Modern UI with alternating row colors and intuitive editing

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **react-markdown** for markdown rendering
- **remark-gfm** for GitHub Flavored Markdown support
- **CSS-in-JS** for component styling

### Backend
- **PHP 8+** with built-in web server
- **MySQL** database
- **RESTful API** design
- **CORS** enabled for cross-origin requests

## Project Structure

```
tasklistapp/
├── backend/
│   ├── public/
│   │   ├── api/
│   │   │   ├── tasks.php          # Task CRUD operations
│   │   │   │   └── completed_steps.php # Completed steps management
│   │   │   └── index.php              # Backend entry point
│   │   └── src/
│   │       ├── Database.php           # Database connection and queries
│   │       └── TaskController.php     # Task business logic
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── AddTask.jsx        # Task creation form
│   │   │   │   ├── EditableOverlay.jsx # Inline editing overlay
│   │   │   │   ├── FormattedText.jsx  # Text formatting with links
│   │   │   │   ├── MarkdownText.jsx   # Markdown rendering component
│   │   │   │   └── SingleTaskView.jsx # Detailed task view
│   │   │   ├── utils/
│   │   │   │   └── textUtils.js       # Text processing utilities
│   │   │   ├── App.jsx                # Main application component
│   │   │   └── main.jsx               # Application entry point
│   │   └── package.json
│   └── db/                            # Database schema and migrations
└── start-dev.sh                   # Development startup script
```

## Database Schema

### Tasks Table
- `id` (INT, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `status` (ENUM: 'active', 'completed', 'on_hold')
- `priority` (ENUM: 'high', 'medium', 'low')
- `next_step` (TEXT)
- `milestones` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Completed Steps Table
- `id` (INT, Primary Key)
- `task_id` (INT, Foreign Key)
- `step_text` (TEXT)
- `completed_at` (TIMESTAMP)

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- PHP 8+
- MySQL 5.7+ or MariaDB 10.2+

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd tasklistapp
   ```

2. **Set up the database**
   ```bash
   # Create database and import schema
   mysql -u root -p
   CREATE DATABASE tasklist;
   USE tasklist;
   # Import schema from db/ directory
   ```

3. **Configure the backend**
   ```bash
   cd backend/src
   # Update Database.php with your database credentials
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

5. **Start the development servers**
   ```bash
   # From the project root
   ./start-dev.sh
   ```

   Or start manually:
   ```bash
   # Backend (from backend directory)
   php -S localhost:8000 -t public

   # Frontend (from frontend directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## API Endpoints

### Tasks
- `GET /api/tasks.php` - Get all tasks
- `POST /api/tasks.php` - Create a new task
- `PUT /api/tasks.php` - Update a task
- `DELETE /api/tasks.php?id={id}` - Delete a task

### Completed Steps
- `GET /api/completed_steps.php?task_id={id}` - Get completed steps for a task
- `POST /api/completed_steps.php` - Mark a step as completed

## Development

### Adding New Features
1. Update the database schema if needed
2. Add backend API endpoints
3. Create or update frontend components
4. Test thoroughly

### Code Style
- Use consistent indentation (2 spaces for JSX, 4 for PHP)
- Follow React functional component patterns
- Use meaningful variable and function names
- Add comments for complex logic

## Deployment

### Backend Deployment
- Deploy PHP files to your web server
- Configure MySQL database
- Update database connection settings
- Ensure CORS headers are properly configured

### Frontend Deployment
- Build the production version: `npm run build`
- Deploy the `dist/` folder to your web server
- Update API endpoints to point to production backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions, please create an issue in the GitHub repository. 