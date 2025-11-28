#!/bin/bash

# Quick sync script to update Vercel environment variables
# Prerequisites: Must be logged in to Vercel (run: npx vercel login)

set -e

echo "🔄 Quick Sync: Local DB → Vercel"
echo "=================================="
echo ""

# Determine Vercel command
if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
elif [ -f "node_modules/.bin/vercel" ]; then
    VERCEL_CMD="npx vercel"
else
    echo "❌ Vercel CLI not found!"
    echo "   Run: npm install --save-dev vercel"
    exit 1
fi

# Check if logged in
if ! $VERCEL_CMD whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel!"
    echo ""
    echo "Please login first:"
    echo "   $VERCEL_CMD login"
    echo ""
    echo "This will open a browser for authentication."
    exit 1
fi

echo "✅ Logged in as: $($VERCEL_CMD whoami)"
echo ""

# Read local env vars
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    exit 1
fi

MONGODB_URI=$(grep "^MONGODB_URI=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
JWT_SECRET=$(grep "^JWT_SECRET=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$MONGODB_URI" ]; then
    echo "❌ MONGODB_URI not found in .env.local"
    exit 1
fi

echo "📋 Local Configuration:"
echo "   Database: ${MONGODB_URI:0:60}..."
echo ""

# Update MONGODB_URI
echo "🔄 Updating MONGODB_URI in Vercel..."

# Remove old (ignore errors)
$VERCEL_CMD env rm MONGODB_URI production --yes 2>/dev/null || true
$VERCEL_CMD env rm MONGODB_URI preview --yes 2>/dev/null || true
$VERCEL_CMD env rm MONGODB_URI development --yes 2>/dev/null || true

# Add new
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI production
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI preview
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI development

echo "✅ MONGODB_URI synced!"
echo ""

# Update JWT_SECRET if exists
if [ ! -z "$JWT_SECRET" ]; then
    echo "🔄 Updating JWT_SECRET in Vercel..."
    
    $VERCEL_CMD env rm JWT_SECRET production --yes 2>/dev/null || true
    $VERCEL_CMD env rm JWT_SECRET preview --yes 2>/dev/null || true
    $VERCEL_CMD env rm JWT_SECRET development --yes 2>/dev/null || true
    
    echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET production
    echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET preview
    echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET development
    
    echo "✅ JWT_SECRET synced!"
    echo ""
fi

echo "🚀 Triggering redeployment..."
echo ""

# Redeploy
$VERCEL_CMD --prod

echo ""
echo "✅ Sync Complete!"
echo ""
echo "📊 Summary:"
echo "   - Local and Vercel now use the same MongoDB database"
echo "   - Redeployment triggered"
echo ""
echo "🌐 Check deployment: https://cl1-ashen.vercel.app/"
echo ""


