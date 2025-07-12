#!/bin/bash

echo "🚀 Building React frontend..."
cd frontend

# Install dependencies
npm install

# Build the React app
npm run build

echo "📁 Copying built files to backend public directory..."
# Copy the built files to the backend public directory
cp -r dist/* ../backend/public/

echo "✅ Build complete! Ready for Railway deployment." 