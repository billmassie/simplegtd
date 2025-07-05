#!/bin/bash

echo "🚀 Starting Task List App Development Environment..."

# Start MySQL
echo "🐬 Starting MySQL..."
brew services start mysql >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ MySQL started"
else
    echo "⚠️  MySQL might already be running"
fi

# Start PHP server
echo "🔧 Starting PHP backend server on http://localhost:8000"
cd backend
php -S localhost:8000 -t public 