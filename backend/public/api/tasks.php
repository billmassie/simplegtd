<?php
header('Content-Type: application/json');

// CORS configuration - allow from any origin in development, or specific origin in production
$allowed_origin = $_ENV['ALLOWED_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Debug logging function
function debug_log($message) {
    error_log("[DEBUG] " . print_r($message, true));
}

debug_log("Request received at " . date('Y-m-d H:i:s'));


// Database connection - use environment variables with fallbacks for local development
$dbhost = getenv('MYSQLHOST') ?: 'localhost';
$dbname = getenv('MYSQLDATABASE') ?: 'tasklistapp';
$dbuser = getenv('MYSQLUSER') ?: 'root';
$dbpassword = getenv('MYSQLPASSWORD') ?: '';


try {
    $pdo = new PDO("mysql:host=$dbhost;dbname=$dbname", "$dbuser", "$dbpassword");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    debug_log("Database connection successful");

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Fetch all tasks with their most recent completed step
            debug_log("Fetching tasks with last completed step...");
            $stmt = $pdo->query('
                SELECT 
                    t.*,
                    cs.description as last_step_description,
                    cs.completed_at as last_step_completed_at
                FROM tasks t
                LEFT JOIN (
                    SELECT 
                        task_id,
                        description,
                        completed_at,
                        ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY completed_at DESC) as rn
                    FROM completed_steps
                ) cs ON t.task_id = cs.task_id AND cs.rn = 1
                ORDER BY t.created_at DESC
            ');
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            debug_log("Found " . count($tasks) . " tasks");
            echo json_encode($tasks);
            break;

        case 'POST':
            // Get JSON data from request body
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['title']) || empty(trim($data['title']))) {
                throw new Exception('Title is required');
            }

            // Insert new task
            $stmt = $pdo->prepare('INSERT INTO tasks (title) VALUES (?)');
            $stmt->execute([trim($data['title'])]);

            // Get the inserted task
            $taskId = $pdo->lastInsertId();
            $stmt = $pdo->prepare('SELECT * FROM tasks WHERE task_id = ?');
            $stmt->execute([$taskId]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);

            // Add support for milestones
            if (isset($data['milestones'])) {
                $milestones = $data['milestones'];
                $stmt = $pdo->prepare('UPDATE tasks SET milestones = ? WHERE task_id = ?');
                $stmt->execute([$milestones, $taskId]);
            }
            // Add support for notes
            if (isset($data['notes'])) {
                $notes = $data['notes'];
                $stmt = $pdo->prepare('UPDATE tasks SET notes = ? WHERE task_id = ?');
                $stmt->execute([$notes, $taskId]);
            }

            echo json_encode($task);
            break;

        case 'PUT':
            // Get JSON data from request body
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['task_id'])) {
                throw new Exception('Task ID is required');
            }

            $taskId = $data['task_id'];
            $updates = [];
            $params = [];

            // Build update query dynamically based on provided fields
            if (array_key_exists('next_step', $data)) {
                $updates[] = 'next_step = ?';
                $params[] = $data['next_step'];
            }
            if (isset($data['title'])) {
                $updates[] = 'title = ?';
                $params[] = $data['title'];
            }
            if (isset($data['status'])) {
                $updates[] = 'status = ?';
                $params[] = $data['status'];
            }
            if (isset($data['priority'])) {
                $updates[] = 'priority = ?';
                $params[] = $data['priority'];
            }
            if (array_key_exists('milestones', $data)) {
                $updates[] = 'milestones = ?';
                $params[] = $data['milestones'];
            }
            // Add support for notes
            if (array_key_exists('notes', $data)) {
                $updates[] = 'notes = ?';
                $params[] = $data['notes'];
            }

            if (empty($updates)) {
                throw new Exception('No fields to update');
            }

            $params[] = $taskId; // Add task_id for WHERE clause
            $sql = 'UPDATE tasks SET ' . implode(', ', $updates) . ' WHERE task_id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            // Get the updated task with last step data
            $stmt = $pdo->prepare('
                SELECT 
                    t.*,
                    cs.description as last_step_description,
                    cs.completed_at as last_step_completed_at
                FROM tasks t
                LEFT JOIN (
                    SELECT 
                        task_id,
                        description,
                        completed_at,
                        ROW_NUMBER() OVER (PARTITION BY task_id ORDER BY completed_at DESC) as rn
                    FROM completed_steps
                ) cs ON t.task_id = cs.task_id AND cs.rn = 1
                WHERE t.task_id = ?
            ');
            $stmt->execute([$taskId]);
            $task = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode($task);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch(PDOException $e) {
    debug_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch(Exception $e) {
    debug_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
}
?> 