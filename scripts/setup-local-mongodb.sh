#!/bin/bash

# Setup script for local MongoDB development
# This script installs and configures MongoDB locally for development

set -e

echo "🚀 Setting up local MongoDB for development..."

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is already installed"
    mongod --version
else
    echo "📦 Installing MongoDB via Homebrew..."
    brew tap mongodb/brew
    brew install mongodb-community
    
    echo "✅ MongoDB installed successfully"
fi

# Create data directory if it doesn't exist
DATA_DIR="$HOME/data/db"
if [ ! -d "$DATA_DIR" ]; then
    echo "📁 Creating data directory: $DATA_DIR"
    mkdir -p "$DATA_DIR"
fi

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "🔄 Starting MongoDB service..."
    brew services start mongodb-community
    
    # Wait a bit for MongoDB to start
    sleep 3
    
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB started successfully"
    else
        echo "⚠️  MongoDB may not have started. Try running: brew services start mongodb-community"
    fi
fi

# Display connection info
echo ""
echo "📋 MongoDB Connection Details:"
echo "   Connection String: mongodb://localhost:27017/chickenloop"
echo "   Database Name: chickenloop"
echo ""
echo "💡 To use this in your .env.local file, add:"
echo "   MONGODB_URI=mongodb://localhost:27017/chickenloop"
echo ""
echo "🔧 Useful commands:"
echo "   Start MongoDB: brew services start mongodb-community"
echo "   Stop MongoDB:  brew services stop mongodb-community"
echo "   Restart MongoDB: brew services restart mongodb-community"
echo "   View logs:      tail -f /opt/homebrew/var/log/mongodb/mongo.log"
echo ""

