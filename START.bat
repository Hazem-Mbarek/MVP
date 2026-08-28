@echo off
REM LogHub Knowledge System - Quick Start Script for Windows

echo 🚀 LogHub Knowledge System Setup
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%
echo.

REM Setup Backend
echo 📦 Setting up backend...
cd backend
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend folder not found
    exit /b 1
)

REM Install dependencies
if not exist "node_modules" (
    echo   Installing dependencies...
    call npm install
) else (
    echo   Dependencies already installed
)

REM Check if index exists
if not exist "src\knowledge\data\index.json" (
    echo.
    echo 🔨 Building embedding index...
    echo    This takes ^~5-10 minutes on first run
    echo    ⏳ Downloading embedding model (^~500MB^)...
    call npm run build-index
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to build index
        exit /b 1
    )
    echo ✓ Index built successfully
) else (
    echo ✓ Index already exists
)

echo.
echo ==================================
echo ✅ Backend is ready!
echo.
echo Next steps:
echo.
echo 1. Start backend (in this terminal^):
echo    npm run dev
echo.
echo 2. In another terminal, start frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Open http://localhost:3000
echo 4. Go to Chatbot and ask questions!
echo.
echo Try these test queries:
echo   • 'What is FOB?'
echo   • 'Can I ship DDP by rail?'
echo   • 'Compare CIF and DDP'
echo.
echo ==================================
