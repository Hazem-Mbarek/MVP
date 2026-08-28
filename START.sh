#!/bin/bash
# LogHub Knowledge System - Quick Start Script

echo "🚀 LogHub Knowledge System Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend || { echo "❌ Backend folder not found"; exit 1; }

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
else
    echo "  Dependencies already installed"
fi

# Check if index exists
if [ ! -f "src/knowledge/data/index.json" ]; then
    echo ""
    echo "🔨 Building embedding index..."
    echo "   (This takes ~5-10 minutes on first run)"
    echo "   ⏳ Downloading embedding model (~500MB)..."
    npm run build-index
    
    if [ $? -eq 0 ]; then
        echo "✓ Index built successfully"
    else
        echo "❌ Failed to build index"
        exit 1
    fi
else
    echo "✓ Index already exists"
fi

echo ""
echo "=================================="
echo "✅ Backend is ready!"
echo ""
echo "Next steps:"
echo ""
echo "1. Start backend (in this terminal):"
echo "   npm run dev"
echo ""
echo "2. In another terminal, start frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:3000"
echo "4. Go to Chatbot and ask questions!"
echo ""
echo "Try these test queries:"
echo "  • 'What is FOB?'"
echo "  • 'Can I ship DDP by rail?'"
echo "  • 'Compare CIF and DDP'"
echo ""
echo "=================================="
