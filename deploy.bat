@echo off
REM Sevak Medical Chatbot Deployment Script for Windows
REM This script builds and deploys the application

echo 🚀 Starting Sevak Medical Chatbot Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% LSS 16 (
    echo [ERROR] Node.js version 16+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo [SUCCESS] Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] npm version: 
npm --version

REM Install dependencies
echo [INFO] Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies installed successfully

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found. Creating from template...
    if exist env.example (
        copy env.example .env
        echo [WARNING] Please update .env file with your actual configuration values
    ) else (
        echo [ERROR] env.example file not found. Please create .env file manually
        pause
        exit /b 1
    )
)

REM Build the React application
echo [INFO] Building React application...
npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Failed to build React application
    pause
    exit /b 1
)

echo [SUCCESS] React application built successfully

REM Check if build directory exists
if not exist build (
    echo [ERROR] Build directory not found. Build process may have failed.
    pause
    exit /b 1
)

REM Start the server
echo [INFO] Starting Sevak Medical Chatbot server...
echo [INFO] Frontend will be available at: http://localhost:3000
echo [INFO] API will be available at: http://localhost:5000/api
echo [INFO] Health check: http://localhost:5000/api/health

REM Start the server
node server.js

REM If we reach here, the server has stopped
echo [WARNING] Server stopped
pause
