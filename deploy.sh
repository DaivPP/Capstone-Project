#!/bin/bash

# Sevak Medical Chatbot Deployment Script
# This script builds and deploys the application

echo "🚀 Starting Sevak Medical Chatbot Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        print_warning "Please update .env file with your actual configuration values"
    else
        print_error "env.example file not found. Please create .env file manually"
        exit 1
    fi
fi

# Build the React application
print_status "Building React application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build React application"
    exit 1
fi

print_success "React application built successfully"

# Check if build directory exists
if [ ! -d "build" ]; then
    print_error "Build directory not found. Build process may have failed."
    exit 1
fi

# Start the server
print_status "Starting Sevak Medical Chatbot server..."
print_status "Frontend will be available at: http://localhost:3000"
print_status "API will be available at: http://localhost:5000/api"
print_status "Health check: http://localhost:5000/api/health"

# Start the server
node server.js

# If we reach here, the server has stopped
print_warning "Server stopped"
