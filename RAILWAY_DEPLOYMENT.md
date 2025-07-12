# Railway Same-Domain Deployment Guide

This guide will help you deploy your Task List Application to Railway with both frontend and backend on the same domain.

## 🚀 **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

1. **Ensure all files are committed:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Verify your repository structure:**
   ```
   tasklistapp/
   ├── railway.json              # Railway configuration
   ├── railway-build.sh          # Build script
   ├── backend/
   │   ├── public/               # Will contain built frontend
   │   └── src/
   └── frontend/
       ├── src/
       └── package.json
   ```

### **Step 2: Deploy to Railway**

1. **Go to [Railway.app](https://railway.app)**
   - Sign up/login with your GitHub account

2. **Create a new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `tasklistapp` repository

3. **Railway will automatically:**
   - Detect it's a PHP project
   - Run the build script (`railway-build.sh`)
   - Deploy your application

### **Step 3: Add Database**

1. **Add MySQL database:**
   - In your Railway project, click "New"
   - Select "Database" → "MySQL"
   - Railway will provide connection details

2. **Set environment variables:**
   - Go to your project settings
   - Add these variables:
   ```
   DB_HOST=your-mysql-host
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASS=your-database-password
   ```

### **Step 4: Configure API URLs**

1. **For same-domain deployment (recommended):**
   - No environment variables needed
   - API calls will use relative URLs automatically

2. **For separate domain (if needed):**
   - Add: `VITE_API_BASE_URL=https://your-app.railway.app`

### **Step 5: Access Your App**

- Your app will be available at: `https://your-app.railway.app`
- The React frontend and PHP backend are served from the same domain
- No CORS issues!

## 🔧 **How It Works**

### **Build Process:**
1. Railway runs `railway-build.sh`
2. Installs Node.js dependencies
3. Builds React frontend (`npm run build`)
4. Copies built files to `backend/public/`
5. Starts PHP server serving both frontend and API

### **File Structure After Build:**
```
backend/public/
├── index.html          # React app entry point
├── assets/             # React built assets
└── api/                # PHP API endpoints
    ├── tasks.php
    └── completed_steps.php
```

### **URL Structure:**
- **Frontend**: `https://your-app.railway.app/`
- **API**: `https://your-app.railway.app/api/tasks.php`
- **Same domain** = No CORS issues!

## 🐛 **Troubleshooting**

### **Build Fails:**
- Check Railway build logs
- Ensure `railway-build.sh` is executable
- Verify Node.js and npm are available

### **Database Connection Issues:**
- Verify environment variables are set correctly
- Check database credentials in Railway dashboard
- Ensure database is accessible from Railway

### **Frontend Not Loading:**
- Check if build files were copied to `backend/public/`
- Verify PHP server is serving static files
- Check Railway logs for errors

### **API Calls Failing:**
- Verify API endpoints are accessible
- Check PHP error logs
- Ensure database connection is working

## 🎉 **Benefits of This Setup**

- ✅ **Single deployment** - Everything on one platform
- ✅ **No CORS issues** - Same domain for frontend and API
- ✅ **Cost effective** - One Railway instance
- ✅ **Simple management** - One dashboard for everything
- ✅ **Automatic HTTPS** - Railway provides SSL certificates
- ✅ **Easy scaling** - Railway handles scaling automatically

## 🔄 **Continuous Deployment**

- Push to your `main` branch
- Railway automatically rebuilds and deploys
- No manual intervention needed

Your task list will be available 24/7 from anywhere in the world! 