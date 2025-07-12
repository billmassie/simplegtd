<?php
/**
 * Database Setup Script for Railway Deployment
 * This script creates the database schema and initial data
 */

// Get database credentials from environment variables
$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? 'tasklistapp';
$username = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASS'] ?? '';

echo "🔧 Setting up database schema...\n";
echo "Host: $host\n";
echo "Database: $dbname\n";
echo "User: $username\n";

try {
    // Connect to MySQL server (without specifying database)
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected to MySQL server\n";

    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    echo "✅ Database '$dbname' created/verified\n";

    // Connect to the specific database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected to database '$dbname'\n";

    // Create tasks table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tasks (
            task_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status ENUM('active', 'paused', 'done', 'cancelled') DEFAULT 'active',
            priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
            next_step TEXT,
            milestones TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "✅ Tasks table created/verified\n";

    // Create completed_steps table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS completed_steps (
            completed_step_id INT AUTO_INCREMENT PRIMARY KEY,
            task_id INT NOT NULL,
            description TEXT NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
        )
    ");
    echo "✅ Completed steps table created/verified\n";

    // Create indexes
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_completed_steps_task_id ON completed_steps(task_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_completed_steps_completed_at ON completed_steps(completed_at)");
    echo "✅ Database indexes created/verified\n";

    // Check if we need to insert sample data
    $stmt = $pdo->query("SELECT COUNT(*) FROM tasks");
    $taskCount = $stmt->fetchColumn();

    if ($taskCount == 0) {
        echo "📝 Inserting sample data...\n";
        
        // Insert sample tasks
        $pdo->exec("
            INSERT INTO tasks (title, description, status, priority, next_step, milestones) VALUES
            ('Set up development environment', 'Get the local development environment running smoothly', 'active', 'high', 'Install Node.js dependencies', '- [x] Install Node.js\n- [x] Install PHP\n- [ ] Install MySQL\n- [ ] Set up database schema'),
            ('Deploy to Railway', 'Deploy the application to Railway for production use', 'active', 'medium', 'Create Railway account', '- [ ] Sign up for Railway\n- [ ] Connect GitHub repository\n- [ ] Add MySQL database\n- [ ] Set environment variables\n- [ ] Deploy application'),
            ('Add user authentication', 'Implement user login and authentication system', 'paused', 'low', 'Research authentication options', '- [ ] Consider password protection\n- [ ] Look into OAuth options\n- [ ] Plan session management')
        ");

        // Insert sample completed steps
        $pdo->exec("
            INSERT INTO completed_steps (task_id, description) VALUES
            (1, 'Created React frontend with Vite'),
            (1, 'Set up PHP backend with API endpoints'),
            (1, 'Configured environment variables'),
            (2, 'Created Railway deployment configuration'),
            (2, 'Set up build scripts')
        ");
        
        echo "✅ Sample data inserted\n";
    } else {
        echo "ℹ️  Sample data already exists, skipping...\n";
    }

    echo "🎉 Database setup completed successfully!\n";

} catch(PDOException $e) {
    echo "❌ Database setup failed: " . $e->getMessage() . "\n";
    exit(1);
}
?> 