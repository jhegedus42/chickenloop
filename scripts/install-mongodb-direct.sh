#!/bin/bash

# Direct MongoDB installation script for older macOS
# This downloads and sets up MongoDB without requiring Homebrew or Docker

set -e

echo "🚀 Installing MongoDB directly for macOS..."

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    ARCH_TYPE="arm64"
    TAR_NAME="mongodb-macos-arm64"
elif [ "$ARCH" = "x86_64" ]; then
    ARCH_TYPE="x86_64"
    TAR_NAME="mongodb-macos-x86_64"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi

# MongoDB version compatible with older macOS
MONGO_VERSION="7.0.15"
INSTALL_DIR="$HOME/mongodb"
DATA_DIR="$HOME/data/db"
LOG_DIR="$HOME/mongodb/logs"

echo "📦 Architecture: $ARCH_TYPE"
echo "📦 MongoDB Version: $MONGO_VERSION"
echo "📦 Install Directory: $INSTALL_DIR"

# Create directories
echo "📁 Creating directories..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$DATA_DIR"
mkdir -p "$LOG_DIR"

# Download MongoDB
echo "⬇️  Downloading MongoDB..."
cd "$INSTALL_DIR"

if [ ! -f "mongodb-${MONGO_VERSION}.tgz" ]; then
    echo "Downloading from MongoDB website..."
    curl -L -o "mongodb-${MONGO_VERSION}.tgz" \
        "https://fastdl.mongodb.org/osx/${TAR_NAME}-${MONGO_VERSION}.tgz"
else
    echo "MongoDB archive already downloaded"
fi

# Extract
if [ ! -d "mongodb-${MONGO_VERSION}" ]; then
    echo "📦 Extracting MongoDB..."
    tar -xzf "mongodb-${MONGO_VERSION}.tgz"
    mv "${TAR_NAME}-${MONGO_VERSION}" "mongodb-${MONGO_VERSION}"
else
    echo "MongoDB already extracted"
fi

# Create symlink for easy access
if [ ! -L "$INSTALL_DIR/mongodb" ]; then
    ln -s "mongodb-${MONGO_VERSION}" "$INSTALL_DIR/mongodb"
fi

# Create startup script
echo "📝 Creating startup script..."
cat > "$INSTALL_DIR/start-mongodb.sh" << 'EOF'
#!/bin/bash
MONGODB_HOME="$HOME/mongodb/mongodb"
DATA_DIR="$HOME/data/db"
LOG_DIR="$HOME/mongodb/logs"

# Create directories if they don't exist
mkdir -p "$DATA_DIR"
mkdir -p "$LOG_DIR"

# Start MongoDB
echo "🚀 Starting MongoDB..."
"$MONGODB_HOME/bin/mongod" \
    --dbpath "$DATA_DIR" \
    --logpath "$LOG_DIR/mongodb.log" \
    --fork

echo "✅ MongoDB started!"
echo "📋 Connection: mongodb://localhost:27017/chickenloop"
EOF

chmod +x "$INSTALL_DIR/start-mongodb.sh"

# Create stop script
cat > "$INSTALL_DIR/stop-mongodb.sh" << 'EOF'
#!/bin/bash
MONGODB_HOME="$HOME/mongodb/mongodb"

echo "🛑 Stopping MongoDB..."
"$MONGODB_HOME/bin/mongosh" admin --eval "db.shutdownServer()" 2>/dev/null || \
    pkill -f mongod || echo "MongoDB not running"

echo "✅ MongoDB stopped"
EOF

chmod +x "$INSTALL_DIR/stop-mongodb.sh"

echo ""
echo "✅ MongoDB installation complete!"
echo ""
echo "📋 To start MongoDB, run:"
echo "   $INSTALL_DIR/start-mongodb.sh"
echo ""
echo "📋 To stop MongoDB, run:"
echo "   $INSTALL_DIR/stop-mongodb.sh"
echo ""
echo "📋 Add to your PATH (add to ~/.zshrc or ~/.bash_profile):"
echo "   export PATH=\"\$PATH:$INSTALL_DIR/mongodb/bin\""
echo ""

