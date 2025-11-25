#!/bin/bash

# Script to sync Vercel database with local database
# This ensures both environments use the same MongoDB Atlas database

set -e

echo "🔄 Syncing Vercel Database with Local Database"
echo "================================================"
echo ""

# Read local MONGODB_URI from .env.local
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "   Please create .env.local with your MONGODB_URI first."
    exit 1
fi

MONGODB_URI=$(grep "^MONGODB_URI=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
JWT_SECRET=$(grep "^JWT_SECRET=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI not found in .env.local!"
    exit 1
fi

echo "📋 Local Configuration:"
echo "   MONGODB_URI: ${MONGODB_URI:0:50}..."
echo ""

# Check if Vercel CLI is installed (try npx first, then global)
if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
elif [ -f "node_modules/.bin/vercel" ]; then
    VERCEL_CMD="npx vercel"
else
    echo "❌ Vercel CLI is not installed!"
    echo ""
    echo "Please install it first:"
    echo "   npm install --save-dev vercel"
    echo ""
    echo "Then login:"
    echo "   npx vercel login"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI found: $($VERCEL_CMD --version | head -1)"
echo ""

# Check if logged in to Vercel
if ! $VERCEL_CMD whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel!"
    echo "   Please run: $VERCEL_CMD login"
    exit 1
fi

echo "✅ Logged in to Vercel as: $($VERCEL_CMD whoami)"
echo ""

echo "📝 Updating Vercel environment variables..."
echo ""

# Update MONGODB_URI
echo "🔄 Updating MONGODB_URI..."
$VERCEL_CMD env rm MONGODB_URI production --yes 2>/dev/null || true
$VERCEL_CMD env rm MONGODB_URI preview --yes 2>/dev/null || true
$VERCEL_CMD env rm MONGODB_URI development --yes 2>/dev/null || true

echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI production
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI preview
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI development

echo "✅ MONGODB_URI updated!"
echo ""

# Update JWT_SECRET if it exists
if [ ! -z "$JWT_SECRET" ]; then
    echo "🔄 Updating JWT_SECRET..."
    $VERCEL_CMD env rm JWT_SECRET production --yes 2>/dev/null || true
    $VERCEL_CMD env rm JWT_SECRET preview --yes 2>/dev/null || true
    $VERCEL_CMD env rm JWT_SECRET development --yes 2>/dev/null || true
    
    echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET production
    echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET preview
    echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET development
    
    echo "✅ JWT_SECRET updated!"
    echo ""
fi

echo "🚀 Triggering redeployment..."
echo ""

# Trigger a redeployment
$VERCEL_CMD --prod

echo ""
echo "✅ Database sync complete!"
echo ""
echo "📊 Summary:"
echo "   - Local and Vercel now use the same MongoDB database"
echo "   - Any data added locally will be visible in Vercel"
echo "   - Any data added in Vercel will be visible locally"
echo ""
echo "💡 Note: Both environments are now connected to the same database."
echo "   No manual data migration needed - they're automatically synced!"
echo ""
echo "🌐 Test your deployment at: https://cl1-ashen.vercel.app/"
echo ""

