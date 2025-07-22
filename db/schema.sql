-- Task List Application Database Schema
-- This file contains all the tables and initial data needed for the application

-- Create the database (if not exists)
CREATE DATABASE IF NOT EXISTS tasklistapp;
USE tasklistapp;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'paused', 'done', 'cancelled') DEFAULT 'active',
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    next_step TEXT,
    milestones TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Completed steps table
CREATE TABLE IF NOT EXISTS completed_steps (
    completed_step_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    description TEXT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_completed_steps_task_id ON completed_steps(task_id);
CREATE INDEX idx_completed_steps_completed_at ON completed_steps(completed_at);

-- Insert some sample data (optional)
INSERT INTO tasks (title, description, status, priority, next_step, milestones) VALUES
('Set up development environment', 'Get the local development environment running smoothly', 'active', 'high', 'Install Node.js dependencies', '- [x] Install Node.js\n- [x] Install PHP\n- [ ] Install MySQL\n- [ ] Set up database schema'),
('Deploy to Railway', 'Deploy the application to Railway for production use', 'active', 'medium', 'Create Railway account', '- [ ] Sign up for Railway\n- [ ] Connect GitHub repository\n- [ ] Add MySQL database\n- [ ] Set environment variables\n- [ ] Deploy application'),
('Add user authentication', 'Implement user login and authentication system', 'paused', 'low', 'Research authentication options', '- [ ] Consider password protection\n- [ ] Look into OAuth options\n- [ ] Plan session management');

-- Insert sample completed steps
INSERT INTO completed_steps (task_id, description) VALUES
(1, 'Created React frontend with Vite'),
(1, 'Set up PHP backend with API endpoints'),
(1, 'Configured environment variables'),
(2, 'Created Railway deployment configuration'),
(2, 'Set up build scripts'); 