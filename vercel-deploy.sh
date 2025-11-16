#!/bin/bash

# Automated Vercel Deployment Script
# This will attempt to deploy your project

set -e

echo "🚀 Starting Vercel Deployment..."
echo ""

# Check if already linked
if [ -f ".vercel/project.json" ]; then
    echo "✅ Project already linked to Vercel"
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    echo "   Project ID: $PROJECT_ID"
else
    echo "📝 Linking project to Vercel..."
    echo "   (This may require authentication)"
fi

echo ""
echo "🌐 Deploying to Vercel..."
echo ""

# Try to deploy
vercel --yes --prod 2>&1 || {
    echo ""
    echo "⚠️  Deployment requires authentication"
    echo ""
    echo "Please run this command manually:"
    echo "   vercel login"
    echo "   vercel --prod"
    echo ""
    echo "Or deploy via website:"
    echo "   https://vercel.com/new"
    echo ""
    exit 1
}

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Don't forget to add environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo ""

