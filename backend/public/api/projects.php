<?php
header('Content-Type: application/json');

// CORS configuration - allow from any origin in development, or specific origin in production
$allowed_origin = $_ENV['ALLOWED_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

debug_log("Projects API request received at " . date('Y-m-d H:i:s'));

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
            // Fetch all projects
            debug_log("Fetching all projects...");
            $stmt = $pdo->query('SELECT * FROM projects ORDER BY name ASC');
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
            debug_log("Found " . count($projects) . " projects");
            echo json_encode($projects);
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