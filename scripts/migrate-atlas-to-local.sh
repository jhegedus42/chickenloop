#!/bin/bash

# Script to migrate data from MongoDB Atlas to local MongoDB
# This exports all data from Atlas and imports it to local MongoDB

set -e

echo "🔄 MongoDB Atlas to Local Migration Script"
echo "=========================================="
echo ""

# Check if mongodump and mongorestore are available
if ! command -v mongodump &> /dev/null; then
    echo "❌ mongodump not found. Installing MongoDB Database Tools..."
    echo ""
    echo "Please install MongoDB Database Tools:"
    echo "  Option 1: Download from https://www.mongodb.com/try/download/database-tools"
    echo "  Option 2: Install via Homebrew: brew install mongodb-database-tools"
    echo ""
    read -p "Press Enter after installing, or Ctrl+C to cancel..."
fi

if ! command -v mongorestore &> /dev/null; then
    echo "❌ mongorestore not found. Please install MongoDB Database Tools."
    exit 1
fi

# Get Atlas connection string
echo "📋 MongoDB Atlas Connection"
echo "---------------------------"
echo "We need your MongoDB Atlas connection string."
echo ""

# Try to get from backup .env.local
ATLAS_URI=""
if [ -f ".env.local.bak" ]; then
    ATLAS_URI=$(grep "^MONGODB_URI=" .env.local.bak | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    if [ ! -z "$ATLAS_URI" ]; then
        echo "Found Atlas URI in .env.local.bak"
        echo "Atlas URI: ${ATLAS_URI:0:50}..."
        read -p "Use this connection string? (y/n): " use_backup
        if [ "$use_backup" != "y" ]; then
            ATLAS_URI=""
        fi
    fi
fi

if [ -z "$ATLAS_URI" ]; then
    echo "Please enter your MongoDB Atlas connection string:"
    echo "Format: mongodb+srv://username:password@cluster.mongodb.net/database"
    read -p "Atlas URI: " ATLAS_URI
fi

# Local MongoDB connection
LOCAL_URI="mongodb://localhost:27017/chickenloop"

echo ""
echo "📋 Migration Details"
echo "-------------------"
echo "Source (Atlas): ${ATLAS_URI:0:50}..."
echo "Destination (Local): $LOCAL_URI"
echo ""

# Confirm
read -p "Continue with migration? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Migration cancelled."
    exit 0
fi

# Create backup directory
BACKUP_DIR="./mongodb-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "📦 Step 1: Exporting data from MongoDB Atlas..."
echo "This may take a few minutes depending on data size..."
echo ""

# Export from Atlas
mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR" 2>&1 | tee "$BACKUP_DIR/export.log"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Export failed. Check the log: $BACKUP_DIR/export.log"
    exit 1
fi

echo ""
echo "✅ Export completed!"
echo ""

# Check if local MongoDB is running
echo "🔍 Checking local MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Local MongoDB is not running."
    echo "Starting MongoDB..."
    if [ -f ~/mongodb/start-mongodb.sh ]; then
        ~/mongodb/start-mongodb.sh
        sleep 3
    else
        echo "❌ Could not start MongoDB. Please start it manually."
        exit 1
    fi
fi

echo "✅ Local MongoDB is running"
echo ""

# Get database name from Atlas URI
DB_NAME=$(echo "$ATLAS_URI" | sed -n 's/.*\/\([^?]*\).*/\1/p')
if [ -z "$DB_NAME" ]; then
    DB_NAME="chickenloop"
fi

echo "📥 Step 2: Importing data to local MongoDB..."
echo "Database: $DB_NAME"
echo ""

# Import to local
mongorestore --uri="$LOCAL_URI" --drop "$BACKUP_DIR/$DB_NAME" 2>&1 | tee "$BACKUP_DIR/import.log"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Import failed. Check the log: $BACKUP_DIR/import.log"
    exit 1
fi

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📊 Summary:"
echo "  - Backup saved to: $BACKUP_DIR"
echo "  - Data imported to: $LOCAL_URI"
echo ""
echo "🔍 Verify the migration:"
echo "  ~/mongodb/mongodb/bin/mongosh $LOCAL_URI --eval 'db.stats()'"
echo ""

