#!/bin/bash

echo "🔧 Railway build process starting..."

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