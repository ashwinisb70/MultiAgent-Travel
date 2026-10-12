# TripGenie Setup Guide - Windows PowerShell

This guide will help you set up TripGenie on Windows using PowerShell.

## Prerequisites

Before starting, ensure you have installed:

1. **Python 3.9+**
   - Download from: https://www.python.org/downloads/
   - ✅ Check the "Add Python to PATH" option during installation
   - Verify: Open PowerShell and run `python --version`

2. **Node.js 16+ LTS**
   - Download from: https://nodejs.org/
   - Verify: Run `node --version` and `npm --version` in PowerShell

3. **PostgreSQL 12+**
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, remember the password you set for 'postgres' user
   - Default port: 5432
   - Verify: Run `psql --version` in PowerShell

4. **Git** (recommended)
   - Download from: https://git-scm.com/download/win
   - Or use: `winget install Git.Git`

## Step 1: Extract the Project

```powershell
# Navigate to your desired location
cd $env:USERPROFILE\Desktop

# Extract the ZIP file
Expand-Archive Multi-Agent-Travel-Planner.zip -DestinationPath .

# Navigate to project directory
cd multi-agent-travel-planner
```

## Step 2: Set Up Database

```powershell
# Open PowerShell as Administrator

# Connect to PostgreSQL
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE tripgenie_db;
CREATE USER tripgenie WITH PASSWORD 'tripgenie';
ALTER ROLE tripgenie SET client_encoding TO 'utf8';
ALTER ROLE tripgenie SET default_transaction_isolation TO 'read committed';
ALTER ROLE tripgenie SET default_transaction_deferrable TO on;
ALTER ROLE tripgenie SET default_search_path TO public;
GRANT ALL PRIVILEGES ON DATABASE tripgenie_db TO tripgenie;

# Exit psql
\q
```

Verify connection:
```powershell
psql -U tripgenie -d tripgenie_db
# Should connect successfully
\q
```

## Step 3: Set Up Backend (Python)

```powershell
# Navigate to project root
cd C:\path\to\multi-agent-travel-planner

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Navigate back to project root
cd ..

# Copy environment file
Copy-Item .env.example .env

# Edit .env with your settings (optional, defaults work for local dev)
# notepad .env
```

Run database migrations (if applicable):
```powershell
cd backend
# alembic upgrade head  # Uncomment when migrations are ready
cd ..
```

Seed demo data:
```powershell
python scripts/seed_demo_data.py
# Output should show:
# ✓ Demo data created successfully!
# - User: demo@tripgenie.com (password: Demo123!)
# - Demo Trip: Paris Holiday
```

## Step 4: Start Backend Server

Open a PowerShell terminal and run:

```powershell
# Ensure virtual environment is active
.\venv\Scripts\Activate.ps1

# Navigate to backend
cd backend

# Start FastAPI server
python -m uvicorn app.main:app --reload --port 8000

# Output should show:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete
```

✅ **Backend is running at**: http://localhost:8000
✅ **API Docs at**: http://localhost:8000/docs

**Keep this terminal open. Open a new terminal for frontend.**

## Step 5: Set Up Frontend (Node.js/React)

Open a **new PowerShell terminal** and run:

```powershell
# Navigate to project root
cd C:\path\to\multi-agent-travel-planner

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Output should show:
# Local: http://localhost:5173/
```

✅ **Frontend is running at**: http://localhost:5173

## Step 6: Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. You should see the TripGenie landing page
3. Click "Get Started" to register or "Login" to use demo account

### Demo Account (already created via seed script)
- **Email**: demo@tripgenie.com
- **Password**: Demo123!

## Step 7: Run Tests

### Backend Tests

```powershell
# In terminal with activated venv
cd backend
pytest tests/ -v
```

### Frontend Checks

```powershell
# In frontend directory
cd frontend
npm run lint
npm run build
```

## Common Issues & Solutions

### Issue: Python not found
**Solution**: 
- Add Python to PATH: `python` doesn't work
- Reinstall Python and check "Add Python to PATH"
- Or use full path: `C:\Python311\python.exe`

### Issue: Virtual environment won't activate
**Solution**:
```powershell
# Check execution policy
Get-ExecutionPolicy

# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Try activate again
.\venv\Scripts\Activate.ps1
```

### Issue: PostgreSQL connection error
**Solution**:
```powershell
# Check PostgreSQL service is running
Get-Service postgresql*

# Test connection
psql -U postgres -d tripgenie_db

# If failed, check credentials in .env
# DATABASE_URL=postgresql://tripgenie:tripgenie@localhost:5432/tripgenie_db
```

### Issue: Port 8000 or 5173 already in use
**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID 12345 /F

# Or change port in startup command
python -m uvicorn app.main:app --reload --port 8001
```

### Issue: npm install fails
**Solution**:
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
npm install --legacy-peer-deps
```

## Docker Alternative Setup

If you prefer Docker instead:

```powershell
# Ensure Docker Desktop is installed and running

cd C:\path\to\multi-agent-travel-planner

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## What's Next?

1. ✅ Register a new account or login with demo account
2. ✅ Create your first trip
3. ✅ Watch AI agents plan your trip
4. ✅ Explore interactive features:
   - Budget breakdown
   - What-If simulator
   - Replanning
   - Group preferences

## Useful Commands

```powershell
# Backend
.\venv\Scripts\Activate.ps1           # Activate Python environment
deactivate                             # Deactivate Python environment
python -m pip list                     # List installed packages
pytest --cov=app                       # Run tests with coverage

# Frontend
npm start                              # Start dev server
npm run build                          # Build for production
npm run lint                           # Run linter

# Database
psql -U tripgenie -d tripgenie_db     # Connect to database
\dt                                    # List tables in psql
\q                                     # Exit psql
```

## Need Help?

1. Check the main README.md for more information
2. Review API documentation at http://localhost:8000/docs
3. Check logs in terminal windows
4. Ensure all services are running (PostgreSQL, Backend, Frontend)

---

**Congratulations! Your TripGenie instance is now running. Happy trip planning! 🌍✈️**
