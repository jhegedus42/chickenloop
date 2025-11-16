#!/bin/bash

# MongoDB Atlas Setup Helper Script
# This script helps you set up MongoDB Atlas and get your connection string

set -e

echo "🍃 MongoDB Atlas Setup Helper"
echo "=============================="
echo ""

echo "This script will guide you through setting up MongoDB Atlas."
echo ""

# Check if MongoDB CLI is available
if command -v mongocli &> /dev/null || command -v mongodb-atlas &> /dev/null; then
    echo "✅ MongoDB CLI detected"
    echo ""
    echo "Would you like to use the CLI? (y/n)"
    read -p "> " USE_CLI
    
    if [ "$USE_CLI" = "y" ]; then
        echo ""
        echo "Please authenticate first:"
        mongocli auth login || mongodb-atlas auth login
        echo ""
        echo "Creating cluster..."
        # Add CLI commands here if needed
    fi
else
    echo "📝 Manual setup required (recommended for first-time users)"
    echo ""
fi

echo ""
echo "🌐 Opening MongoDB Atlas registration page..."
echo ""

# Try to open browser
if command -v open &> /dev/null; then
    open "https://www.mongodb.com/cloud/atlas/register"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://www.mongodb.com/cloud/atlas/register"
elif command -v start &> /dev/null; then
    start "https://www.mongodb.com/cloud/atlas/register"
else
    echo "Please visit: https://www.mongodb.com/cloud/atlas/register"
fi

echo ""
echo "📋 Follow these steps:"
echo ""
echo "1. ✅ Create Account (if you don't have one)"
echo "   - Sign up with email"
echo "   - Verify your email"
echo ""
echo "2. ✅ Create a Free Cluster"
echo "   - Click 'Build a Database'"
echo "   - Choose 'M0 FREE' tier"
echo "   - Select a cloud provider and region (closest to you)"
echo "   - Name it 'chickenloop' or leave default"
echo "   - Click 'Create' (takes 3-5 minutes)"
echo ""
echo "3. ✅ Create Database User"
echo "   - Go to 'Database Access' → 'Add New Database User'"
echo "   - Choose 'Password' authentication"
echo "   - Username: (choose one, e.g., 'chickenloop-user')"
echo "   - Password: (generate secure password or create one)"
echo "   - Save username and password!"
echo "   - Click 'Add User'"
echo ""
echo "4. ✅ Configure Network Access"
echo "   - Go to 'Network Access' → 'Add IP Address'"
echo "   - Click 'Allow Access from Anywhere' (0.0.0.0/0)"
echo "   - Click 'Confirm'"
echo ""
echo "5. ✅ Get Connection String"
echo "   - Go to 'Database' → Click 'Connect' on your cluster"
echo "   - Choose 'Connect your application'"
echo "   - Copy the connection string"
echo "   - Replace <password> with your database user password"
echo "   - Add '/chickenloop' at the end"
echo ""
echo "Example connection string:"
echo "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chickenloop"
echo ""

read -p "Press [ENTER] when you have your connection string ready..."

echo ""
echo "📝 Enter your MongoDB connection string:"
read -p "MONGODB_URI: " MONGODB_URI

if [ -z "$MONGODB_URI" ]; then
    echo "❌ No connection string provided"
    exit 1
fi

echo ""
echo "🔧 Updating Vercel environment variables..."
echo ""

cd "$(dirname "$0")"

# Remove old placeholder
vercel env rm MONGODB_URI production --yes 2>/dev/null || true
vercel env rm MONGODB_URI preview --yes 2>/dev/null || true
vercel env rm MONGODB_URI development --yes 2>/dev/null || true

# Add new one
echo "$MONGODB_URI" | vercel env add MONGODB_URI production
echo "$MONGODB_URI" | vercel env add MONGODB_URI preview
echo "$MONGODB_URI" | vercel env add MONGODB_URI development

echo ""
echo "✅ MongoDB URI updated!"
echo ""
echo "🚀 Redeploying application..."
vercel --prod

echo ""
echo "✅ Setup complete!"
echo ""
echo "Your app is now connected to MongoDB Atlas!"
echo "Visit: https://vercel.com/chickenloop3845-commits-projects/cl1"

