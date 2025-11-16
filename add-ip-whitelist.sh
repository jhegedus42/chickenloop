#!/bin/bash

# Script to add IP whitelist to MongoDB Atlas
# This allows Vercel to connect to your database

set -e

echo "🔧 MongoDB Atlas IP Whitelist Setup"
echo "====================================="
echo ""

# Check if API keys are provided
if [ -z "$ATLAS_PUBLIC_KEY" ] || [ -z "$ATLAS_PRIVATE_KEY" ]; then
    echo "📝 To automate this, we need MongoDB Atlas API keys."
    echo ""
    echo "Quick way to get API keys:"
    echo "1. Go to: https://cloud.mongodb.com/v2#/account/api/keys"
    echo "2. Click 'Create API Key'"
    echo "3. Name it (e.g., 'vercel-setup')"
    echo "4. Copy the Public Key and Private Key"
    echo ""
    echo "Then run:"
    echo "  export ATLAS_PUBLIC_KEY='your-public-key'"
    echo "  export ATLAS_PRIVATE_KEY='your-private-key'"
    echo "  ./add-ip-whitelist.sh"
    echo ""
    echo "Or I can open the Network Access page for manual setup..."
    read -p "Open Network Access page? (y/n): " OPEN_PAGE
    
    if [ "$OPEN_PAGE" = "y" ]; then
        open "https://cloud.mongodb.com/v2#/security/network/whitelist" 2>/dev/null || \
        xdg-open "https://cloud.mongodb.com/v2#/security/network/whitelist" 2>/dev/null || \
        start "https://cloud.mongodb.com/v2#/security/network/whitelist" 2>/dev/null || \
        echo "Please visit: https://cloud.mongodb.com/v2#/security/network/whitelist"
        
        echo ""
        echo "On that page:"
        echo "1. Click 'Add IP Address'"
        echo "2. Click 'Allow Access from Anywhere'"
        echo "3. Click 'Confirm'"
        echo ""
        exit 0
    fi
    exit 1
fi

# Get project ID (we'll need to get this from the user or their config)
echo "Getting project information..."
PROJECT_ID=$(atlas projects list --output json 2>/dev/null | jq -r '.[0].id' || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo "Could not get project ID. Please provide it:"
    read -p "Project ID: " PROJECT_ID
fi

echo ""
echo "Adding IP address 0.0.0.0/0 (Allow from anywhere)..."
echo ""

# Use MongoDB Atlas API to add IP
RESPONSE=$(curl -s -X POST \
  "https://cloud.mongodb.com/api/atlas/v1.0/groups/$PROJECT_ID/accessList" \
  -u "$ATLAS_PUBLIC_KEY:$ATLAS_PRIVATE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ipAddress": "0.0.0.0/0",
    "comment": "Allow Vercel and all IPs"
  }' 2>&1)

if echo "$RESPONSE" | grep -q "error\|Error\|ERROR"; then
    echo "❌ Error adding IP:"
    echo "$RESPONSE"
    echo ""
    echo "Trying manual method..."
    open "https://cloud.mongodb.com/v2#/security/network/whitelist" 2>/dev/null || true
else
    echo "✅ IP address 0.0.0.0/0 added successfully!"
    echo ""
    echo "Wait 1-2 minutes for changes to propagate, then try your app again."
fi

