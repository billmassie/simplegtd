<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Task List API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .endpoint { background: #f4f4f4; padding: 15px; margin: 10px 0; border-radius: 5px; }
        code { background: #e8e8e8; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Task List API</h1>
        <p>Welcome to the Task List API. Available endpoints:</p>
        
        <div class="endpoint">
            <h3>GET /api/tasks.php</h3>
            <p>Retrieve all tasks</p>
            <code>curl http://localhost:8000/api/tasks.php</code>
        </div>
        
        <div class="endpoint">
            <h3>POST /api/tasks.php</h3>
            <p>Create a new task</p>
            <code>curl -X POST -H "Content-Type: application/json" -d '{"title":"New Task"}' http://localhost:8000/api/tasks.php</code>
        </div>
        
        <p><strong>Frontend:</strong> <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></p>
    </div>
</body>
</html> 