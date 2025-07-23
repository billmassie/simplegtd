<?php
header('Content-Type: application/json');
$environment = getenv('ENVIRONMENT') ?: 'development';
echo json_encode(['environment' => $environment]); 