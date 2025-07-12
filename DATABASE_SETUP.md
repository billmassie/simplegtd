# Database Setup Guide

This guide explains how to set up the database schema for your Task List Application in different environments.

## 🗄️ **Database Schema**

The application uses two main tables:

### **Tasks Table**
```sql
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'paused', 'done', 'cancelled') DEFAULT 'active',
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    next_step TEXT,
    milestones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Completed Steps Table**
```sql
CREATE TABLE completed_steps (
    completed_step_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    description TEXT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);
```

## 🚀 **Railway Deployment (Automatic)**

### **What Happens Automatically**
1. Railway creates a MySQL database
2. Build script runs `db/setup-database.php`
3. Database schema is created automatically
4. Sample data is inserted (if database is empty)

### **Environment Variables (Set by Railway)**
```
DB_HOST=your-railway-mysql-host
DB_NAME=your-railway-database-name
DB_USER=your-railway-database-user
DB_PASS=your-railway-database-password
```

### **No Manual Setup Required**
- ✅ Schema created automatically
- ✅ Tables and indexes set up
- ✅ Sample data inserted
- ✅ Ready to use immediately

## 🏠 **Local Development (Manual)**

### **Option 1: Using the Setup Script**
```bash
# Make sure MySQL is running
brew services start mysql

# Run the database setup script
php db/setup-database.php
```

### **Option 2: Using SQL File**
```bash
# Connect to MySQL
mysql -u root -p

# Run the schema file
source db/schema.sql
```

### **Option 3: Manual SQL Commands**
```sql
-- Create database
CREATE DATABASE tasklistapp;
USE tasklistapp;

-- Create tasks table
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'paused', 'done', 'cancelled') DEFAULT 'active',
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    next_step TEXT,
    milestones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create completed_steps table
CREATE TABLE completed_steps (
    completed_step_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    description TEXT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_completed_steps_task_id ON completed_steps(task_id);
CREATE INDEX idx_completed_steps_completed_at ON completed_steps(completed_at);
```

## 🔧 **Database Configuration**

### **Local Development**
```php
// backend/public/api/tasks.php and completed_steps.php
$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? 'tasklistapp';
$username = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASS'] ?? '';
```

### **Railway Production**
- Environment variables are set automatically by Railway
- No configuration needed

## 📊 **Sample Data**

The setup script includes sample data to get you started:

### **Sample Tasks**
1. **Set up development environment** (active, high priority)
2. **Deploy to Railway** (active, medium priority)
3. **Add user authentication** (paused, low priority)

### **Sample Completed Steps**
- Created React frontend with Vite
- Set up PHP backend with API endpoints
- Configured environment variables
- Created Railway deployment configuration
- Set up build scripts

## 🐛 **Troubleshooting**

### **Database Connection Issues**
```bash
# Check if MySQL is running
brew services list | grep mysql

# Test connection
mysql -u root -p -e "SHOW DATABASES;"

# Check environment variables
echo $DB_HOST
echo $DB_NAME
echo $DB_USER
echo $DB_PASS
```

### **Permission Issues**
```sql
-- Grant permissions to user
GRANT ALL PRIVILEGES ON tasklistapp.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### **Table Already Exists**
- The setup script uses `CREATE TABLE IF NOT EXISTS`
- Safe to run multiple times
- Won't overwrite existing data

## 🔄 **Database Migration**

### **Adding New Tables**
1. Update `db/schema.sql`
2. Update `db/setup-database.php`
3. Deploy to Railway (automatic)
4. Run locally: `php db/setup-database.php`

### **Modifying Existing Tables**
```sql
-- Example: Adding a new column
ALTER TABLE tasks ADD COLUMN due_date DATE NULL;
```

## 📁 **Files**

- **`db/schema.sql`** - Complete SQL schema
- **`db/setup-database.php`** - PHP setup script
- **`DATABASE_SETUP.md`** - This guide

## 🎉 **Ready to Use**

Once the database is set up:
- ✅ Tables created with proper structure
- ✅ Indexes for performance
- ✅ Sample data to test with
- ✅ Foreign key constraints for data integrity
- ✅ Ready for your task list application! 