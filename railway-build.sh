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

# Check for MySQL extension
if php -m | grep -q mysql; then
    echo "✅ MySQL extension is available"
elif php -m | grep -q pdo_mysql; then
    echo "✅ PDO MySQL extension is available"
else
    echo "⚠️ MySQL extension not found. Available extensions:"
    php -m
    echo "⚠️ This might cause database connection issues"
fi

# Install PHP dependencies if needed (only if composer is available)
if [ -f "backend/composer.json" ] && command -v composer &> /dev/null; then
    echo "📦 Installing PHP dependencies with Composer..."
    cd backend
    composer install --no-dev --optimize-autoloader
    cd ..
elif [ -f "backend/composer.json" ]; then
    echo "⚠️ Composer not available, skipping PHP dependencies"
fi

echo "🗄️ Setting up database schema..."
# Run database setup script
if [ -f "db/setup-database.php" ]; then
    php db/setup-database.php
fi

echo "✅ Railway build complete!" 