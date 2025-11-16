#!/bin/bash

# Quick script to update MongoDB URI in Vercel
# Run this after you have your MongoDB Atlas connection string

set -e

echo "🔧 MongoDB URI Updater"
echo "======================"
echo ""

if [ -z "$1" ]; then
    echo "Usage: ./update-mongodb-uri.sh 'your-connection-string'"
    echo ""
    echo "Example:"
    echo "  ./update-mongodb-uri.sh 'mongodb+srv://user:pass@cluster.mongodb.net/chickenloop'"
    echo ""
    echo "Or enter your connection string now:"
    read -p "MONGODB_URI: " MONGODB_URI
else
    MONGODB_URI="$1"
fi

if [ -z "$MONGODB_URI" ]; then
    echo "❌ No connection string provided"
    exit 1
fi

echo ""
echo "📝 Updating Vercel environment variables..."
echo ""

# Remove old ones
echo "Removing old MONGODB_URI variables..."
vercel env rm MONGODB_URI production --yes 2>/dev/null || true
vercel env rm MONGODB_URI preview --yes 2>/dev/null || true
vercel env rm MONGODB_URI development --yes 2>/dev/null || true

# Add new ones
echo "Adding new MONGODB_URI for production..."
echo "$MONGODB_URI" | vercel env add MONGODB_URI production

echo "Adding new MONGODB_URI for preview..."
echo "$MONGODB_URI" | vercel env add MONGODB_URI preview

echo "Adding new MONGODB_URI for development..."
echo "$MONGODB_URI" | vercel env add MONGODB_URI development

echo ""
echo "✅ MongoDB URI updated!"
echo ""
echo "🚀 Redeploying application..."
vercel --prod

echo ""
echo "✅ Done! Your app should now be connected to MongoDB Atlas."
echo ""
echo "Test it at: https://vercel.com/chickenloop3845-commits-projects/cl1"

