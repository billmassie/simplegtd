#!/bin/bash

echo "🚀 Starting Task List Application..."

# Check if database environment variables are available
if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ] && [ -n "$DB_USER" ]; then
    echo "🗄️ Setting up database schema..."
    if php db/setup-database.php; then
        echo "✅ Database setup completed"
    else
        echo "❌ Database setup failed"
        exit 1
    fi
else
    echo "⚠️ Database environment variables not set, skipping database setup"
fi

echo "🌐 Starting PHP server..."
php -S 0.0.0.0:$PORT -t backend/public 