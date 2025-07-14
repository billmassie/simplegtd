<?php
header('Content-Type: application/json');

// CORS configuration - allow from any origin in development, or specific origin in production
$allowed_origin = $_ENV['ALLOWED_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

debug_log("Completed steps request received at " . date('Y-m-d H:i:s'));

// Database connection - use environment variables with fallbacks for local development
$dbhost = getenv('MYSQLHOST') ?? 'localhost';
$dbname = getenv('MYSQLDATABASE') ?? 'tasklistapp';
$username = getenv('MYSQLUSER') ?? 'root';
$password = getenv('MYSQLPASSWORD') ?? ''; // empty password for local development

try {
    $pdo = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    debug_log("Database connection successful");

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Fetch all completed steps
            debug_log("Fetching completed steps...");
            $stmt = $pdo->query('SELECT * FROM completed_steps ORDER BY completed_at DESC');
            $steps = $stmt->fetchAll(PDO::FETCH_ASSOC);
            debug_log("Found " . count($steps) . " completed steps");
            echo json_encode($steps);
            break;

        case 'POST':
            // Get JSON data from request body
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['task_id']) || !isset($data['description'])) {
                throw new Exception('Task ID and description are required');
            }

            // Insert new completed step
            $stmt = $pdo->prepare('INSERT INTO completed_steps (task_id, description, completed_at) VALUES (?, ?, NOW())');
            $stmt->execute([$data['task_id'], trim($data['description'])]);

            // Get the inserted step
            $stepId = $pdo->lastInsertId();
            $stmt = $pdo->prepare('SELECT * FROM completed_steps WHERE completed_step_id = ?');
            $stmt->execute([$stepId]);
            $step = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode($step);
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