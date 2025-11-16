#!/bin/bash

# ChickenLoop Deployment Script
# This script helps automate the deployment process

set -e

echo "🚀 ChickenLoop Deployment Helper"
echo "================================"
echo ""

# Check if git remote exists
if git remote get-url origin &>/dev/null; then
    echo "✅ Git remote already configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote: $REMOTE_URL"
else
    echo "📝 Setting up GitHub repository..."
    echo ""
    echo "Please provide your GitHub repository URL:"
    echo "   Example: https://github.com/username/chickenloop.git"
    read -p "GitHub URL: " GITHUB_URL
    
    if [ -z "$GITHUB_URL" ]; then
        echo "❌ No URL provided. Exiting."
        exit 1
    fi
    
    git remote add origin "$GITHUB_URL" 2>/dev/null || git remote set-url origin "$GITHUB_URL"
    echo "✅ Git remote configured"
fi

# Check if we need to push
echo ""
echo "📤 Checking if code needs to be pushed..."
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ All changes are committed"
else
    echo "⚠️  Uncommitted changes detected"
    read -p "Commit and push? (y/n): " COMMIT_CHOICE
    if [ "$COMMIT_CHOICE" = "y" ]; then
        git add .
        git commit -m "Prepare for deployment" || echo "No changes to commit"
    fi
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
if git push -u origin main 2>&1 | grep -q "fatal"; then
    echo "⚠️  Push failed. You may need to:"
    echo "   1. Create the repository on GitHub first"
    echo "   2. Authenticate with GitHub"
    echo ""
    echo "To create repo via GitHub CLI, run:"
    echo "   gh repo create chickenloop --public --source=. --remote=origin --push"
    echo ""
    echo "Or create it manually at: https://github.com/new"
else
    echo "✅ Code pushed to GitHub successfully!"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Go to https://vercel.com and sign in with GitHub"
echo "2. Click 'Add New Project'"
echo "3. Import your repository"
echo "4. Add these environment variables:"
echo ""
echo "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chickenloop"
echo "   JWT_SECRET=2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8="
echo ""
echo "5. Click 'Deploy'"
echo ""
echo "📚 Full guide: See GITHUB_DEPLOY.md"

