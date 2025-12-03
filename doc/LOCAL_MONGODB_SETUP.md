# Local MongoDB Setup for Development

This guide explains how to set up a local MongoDB database for development, avoiding the timeout issues with MongoDB Atlas.

## Option 1: MongoDB via Homebrew (Recommended for macOS)

### Installation

1. **Run the setup script:**
   ```bash
   chmod +x scripts/setup-local-mongodb.sh
   ./scripts/setup-local-mongodb.sh
   ```

2. **Or install manually:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

### Configuration

1. **Update your `.env.local` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/chickenloop
   ```

2. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Useful Commands

- **Start MongoDB:** `brew services start mongodb-community`
- **Stop MongoDB:** `brew services stop mongodb-community`
- **Restart MongoDB:** `brew services restart mongodb-community`
- **View logs:** `tail -f /opt/homebrew/var/log/mongodb/mongo.log`
- **Connect via CLI:** `mongosh mongodb://localhost:27017/chickenloop`

## Option 2: Direct MongoDB Installation (For Older macOS)

If Homebrew or Docker don't work, you can install MongoDB directly:

### Installation

1. **Run the direct installation script:**
   ```bash
   chmod +x scripts/install-mongodb-direct.sh
   ./scripts/install-mongodb-direct.sh
   ```

2. **Or download manually:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: macOS, x86_64 (Intel), TGZ
   - Download and extract to `~/mongodb`
   - Create data directory: `mkdir -p ~/data/db`

### Starting MongoDB

```bash
# Start MongoDB
~/mongodb/mongodb/bin/mongod --dbpath ~/data/db --logpath ~/mongodb/logs/mongodb.log --fork

# Or use the provided script
~/mongodb/start-mongodb.sh
```

### Stopping MongoDB

```bash
# Stop MongoDB
~/mongodb/mongodb/bin/mongosh admin --eval "db.shutdownServer()"

# Or use the provided script
~/mongodb/stop-mongodb.sh
```

## Option 3: MongoDB via Docker (Alternative)

If you prefer Docker, this is even simpler:

### Setup

1. **Start MongoDB container:**
   ```bash
   docker-compose up -d
   ```

2. **Update your `.env.local` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/chickenloop
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### Useful Commands

- **Start:** `docker-compose up -d`
- **Stop:** `docker-compose stop`
- **View logs:** `docker-compose logs -f mongodb`
- **Remove container:** `docker-compose down` (data persists in volume)
- **Remove everything:** `docker-compose down -v` (deletes data)

## Migrating Data from Atlas

If you want to copy your existing data from MongoDB Atlas to local:

### Export from Atlas

```bash
# Install mongodump if needed
brew install mongodb-database-tools

# Export from Atlas (replace with your Atlas connection string)
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/chickenloop" --out=./backup
```

### Import to Local

```bash
# Import to local MongoDB
mongorestore --uri="mongodb://localhost:27017/chickenloop" ./backup/chickenloop
```

## Benefits of Local Development

✅ **No network latency** - Queries are instant  
✅ **No connection limits** - Use as many connections as needed  
✅ **No timeout issues** - Full control over query execution  
✅ **Free** - No cloud costs for development  
✅ **Offline development** - Works without internet  
✅ **Easy to reset** - Clear data anytime  

## Production Setup

For production, you have several options:

### AWS Options

1. **Amazon DocumentDB** (MongoDB-compatible)
   - Fully managed MongoDB-compatible service
   - High availability and automatic backups
   - More expensive but very reliable

2. **MongoDB Atlas on AWS**
   - Official MongoDB cloud service
   - Can deploy on AWS infrastructure
   - Good balance of features and cost

3. **EC2 + Self-hosted MongoDB**
   - Full control but requires maintenance
   - Need to handle backups, updates, etc.
   - Most cost-effective but most work

### Recommended Production Setup

For production, I recommend **MongoDB Atlas** (even though you're having issues now):
- The timeout issues are likely due to connection limits or network issues
- Atlas is the most reliable and feature-rich option
- You can optimize queries and connection pooling to avoid timeouts
- Consider upgrading your Atlas tier if needed

## Troubleshooting

### MongoDB won't start

```bash
# Check if port 27017 is in use
lsof -i :27017

# Check MongoDB logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Connection refused

- Make sure MongoDB is running: `brew services list`
- Check firewall settings
- Verify connection string in `.env.local`

### Permission errors

```bash
# Fix data directory permissions
sudo chown -R $(whoami) ~/data/db
```

## Next Steps

1. Set up local MongoDB using one of the options above
2. Update `.env.local` with local connection string
3. Test your application - queries should be much faster!
4. For production, consider MongoDB Atlas with optimized connection settings

