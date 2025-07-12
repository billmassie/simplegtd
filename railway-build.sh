#!/bin/bash

echo "🔧 Railway build process starting..."

# Make sure we're in the right directory
pwd
ls -la

# Install Node.js dependencies and build frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --production=false

echo "🏗️ Building React frontend..."
npm run build

echo "📁 Copying built files to backend..."
# Copy the built files to the backend public directory
cp -r dist/* ../backend/public/

# Go back to root
cd ..

echo "🐘 Setting up PHP environment..."
# Check if PHP is available
if command -v php &> /dev/null; then
    echo "✅ PHP is available: $(php --version)"
else
    echo "❌ PHP is not available"
    exit 1
fi

# Install PHP dependencies if needed
if [ -f "backend/composer.json" ]; then
    cd backend
    composer install --no-dev --optimize-autoloader
    cd ..
fi

echo "🗄️ Setting up database schema..."
# Run database setup script
if [ -f "db/setup-database.php" ]; then
    php db/setup-database.php
fi

echo "✅ Railway build complete!" 