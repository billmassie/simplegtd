#!/bin/bash

echo "🚀 Starting Task List App in development mode..."

# Start MySQL
echo "🐬 Starting MySQL..."
brew services start mysql >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ MySQL started"
else
    echo "⚠️  MySQL might already be running"
fi

# Check if backend is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "📡 Starting PHP backend server..."
    cd backend
    php -S localhost:8000 -t public &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend started on http://localhost:8000"
else
    echo "✅ Backend already running on http://localhost:8000"
fi

# Start frontend development server
echo "⚛️ Starting React development server..."
cd frontend

# Create .env.local for development if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local for development..."
    echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
fi

npm run dev &
FRONTEND_PID=$!

cd ..

echo "✅ Development servers started!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $FRONTEND_PID $BACKEND_PID 