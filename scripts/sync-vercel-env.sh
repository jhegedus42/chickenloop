#!/bin/bash

# Script to sync local environment variables to Vercel
# Prerequisites: Must be logged in to Vercel (run: npx vercel login first)

set -e

echo "🔄 Syncing Environment Variables to Vercel"
echo "==========================================="
echo ""

# Values to sync
MONGODB_URI="mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369"
JWT_SECRET="2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8="

# Determine Vercel command
if command -v vercel &> /dev/null; then
    VERCEL_CMD="vercel"
elif [ -f "node_modules/.bin/vercel" ]; then
    VERCEL_CMD="npx vercel"
else
    echo "❌ Vercel CLI not found!"
    echo "   Installing Vercel CLI..."
    npm install --save-dev vercel
    VERCEL_CMD="npx vercel"
fi

echo "✅ Using: $VERCEL_CMD"
echo ""

# Check if logged in
echo "🔐 Checking Vercel authentication..."
if ! $VERCEL_CMD whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel!"
    echo ""
    echo "Please login first by running:"
    echo "   $VERCEL_CMD login"
    echo ""
    echo "This will open a browser for authentication."
    echo "After logging in, run this script again."
    exit 1
fi

echo "✅ Logged in as: $($VERCEL_CMD whoami)"
echo ""

# Update MONGODB_URI
echo "🔄 Updating MONGODB_URI..."
echo "   Removing old values..."

# Remove old environment variables (ignore errors if they don't exist)
$VERCEL_CMD env rm MONGODB_URI production --yes 2>/dev/null || true
$VERCEL_CMD env rm MONGODB_URI preview --yes 2>/dev/null || true
$VERCEL_CMD env rm MONGODB_URI development --yes 2>/dev/null || true

echo "   Adding new MONGODB_URI values..."

# Add new values for all environments
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI production
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI preview
echo "$MONGODB_URI" | $VERCEL_CMD env add MONGODB_URI development

echo "✅ MONGODB_URI updated for all environments!"
echo ""

# Update JWT_SECRET
echo "🔄 Updating JWT_SECRET..."
echo "   Removing old values..."

# Remove old environment variables (ignore errors if they don't exist)
$VERCEL_CMD env rm JWT_SECRET production --yes 2>/dev/null || true
$VERCEL_CMD env rm JWT_SECRET preview --yes 2>/dev/null || true
$VERCEL_CMD env rm JWT_SECRET development --yes 2>/dev/null || true

echo "   Adding new JWT_SECRET values..."

# Add new values for all environments
echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET production
echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET preview
echo "$JWT_SECRET" | $VERCEL_CMD env add JWT_SECRET development

echo "✅ JWT_SECRET updated for all environments!"
echo ""

echo "🚀 Triggering production redeployment..."
echo ""

# Trigger redeployment
$VERCEL_CMD --prod

echo ""
echo "✅ Sync Complete!"
echo ""
echo "📊 Summary:"
echo "   ✅ MONGODB_URI synced to Production, Preview, and Development"
echo "   ✅ JWT_SECRET synced to Production, Preview, and Development"
echo "   ✅ Production redeployment triggered"
echo ""
echo "🌐 Your deployment: https://cl1-ashen.vercel.app/"
echo ""
echo "💡 Both local and Vercel now use the same MongoDB database!"
echo "   Any data added locally will be immediately visible in Vercel."
echo ""


