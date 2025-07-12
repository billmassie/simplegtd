# Local Development Guide

This guide shows you how to run your Task List Application locally for development.

## 🚀 **Quick Start (Recommended)**

### **Option 1: Using the Start Script**
```bash
# Make sure the script is executable
chmod +x start-dev.sh

# Start both frontend and backend
./start-dev.sh
```

This will:
- ✅ Start PHP backend on `http://localhost:8000`
- ✅ Start React frontend on `http://localhost:5173`
- ✅ Create `.env.local` automatically
- ✅ Handle API configuration for you

## 🔧 **Manual Setup**

### **Option 2: Separate Terminals**

**Terminal 1 - Backend:**
```bash
cd backend
php -S localhost:8000 -t public
```

**Terminal 2 - Frontend:**
```bash
cd frontend

# Create environment file for local development
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

## 🌐 **Access Your App**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/tasks.php
- **Backend Root**: http://localhost:8000

## 📝 **Environment Configuration**

### **Development Environment File**
Create `frontend/.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### **Available Environment Variables**
- `VITE_API_BASE_URL` - Backend API URL
  - Development: `http://localhost:8000`
  - Production: `https://your-app.railway.app`
  - Same domain: `` (empty)

## 🔄 **Development Workflow**

1. **Start servers**: `./start-dev.sh`
2. **Edit code** in `frontend/src/` or `backend/`
3. **See changes** automatically (hot reload)
4. **Test API** at `http://localhost:8000/api/tasks.php`
5. **Stop servers**: `Ctrl+C`

## 🐛 **Troubleshooting**

### **Backend Won't Start**
```bash
# Check if port 8000 is available
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

### **Frontend Can't Connect to Backend**
- Verify backend is running on port 8000
- Check `.env.local` has correct API URL
- Ensure no CORS issues (should work with localhost)

### **Database Issues**
- Make sure MySQL is running
- Check database credentials in `backend/src/Database.php`
- Verify database exists and tables are created

## 📁 **Project Structure**

```
tasklistapp/
├── start-dev.sh              # Development startup script
├── backend/
│   ├── public/               # PHP server root
│   │   └── api/              # API endpoints
│   └── src/                  # PHP source files
└── frontend/
    ├── .env.local            # Local environment (auto-created)
    ├── src/
    │   ├── config/api.js     # API configuration
    │   └── components/       # React components
    └── package.json
```

## 🎯 **Development Tips**

- **Hot Reload**: Frontend changes appear instantly
- **API Testing**: Use browser dev tools or Postman
- **Database**: Use phpMyAdmin or MySQL CLI
- **Logs**: Check terminal output for errors
- **Build**: Use `./build.sh` to test production build locally

## 🚀 **Ready for Production**

When you're ready to deploy:
1. Push to GitHub: `git push origin main`
2. Deploy to Railway: Follow `RAILWAY_DEPLOYMENT.md`
3. Your app will be live at `https://your-app.railway.app` 