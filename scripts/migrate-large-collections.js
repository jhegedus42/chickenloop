#!/usr/bin/env node

/**
 * Migrate large collections (jobs, cvs) with smaller batches and retry logic
 */

const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369';
const LOCAL_URI = 'mongodb://localhost:27017/chickenloop';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function connect(uri, name) {
  log(`\n🔌 Connecting to ${name}...`, 'blue');
  const conn = await mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 180000, // 3 minutes for large documents
    connectTimeoutMS: 30000,
  }).asPromise();
  log(`✅ Connected to ${name}`, 'green');
  return conn;
}

async function migrateLargeCollection(sourceDb, targetDb, collectionName) {
  log(`\n📦 Migrating ${collectionName} (large collection)...`, 'blue');
  
  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);
  
  const count = await sourceCollection.countDocuments();
  log(`   Found ${count} documents`, 'yellow');
  
  if (count === 0) {
    log(`   ⏭️  Skipping empty collection`, 'yellow');
    return;
  }
  
  // Drop target
  try {
    await targetCollection.drop();
    log(`   🗑️  Dropped existing collection`, 'yellow');
  } catch (e) {}
  
  // Use very small batches for large documents
  const BATCH_SIZE = 10;
  let totalInserted = 0;
  let skip = 0;
  let retries = 0;
  const MAX_RETRIES = 3;
  
  while (skip < count) {
    try {
      // Fetch batch
      const batch = await sourceCollection
        .find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .maxTimeMS(60000) // 1 minute per batch
        .toArray();
      
      if (batch.length === 0) break;
      
      // Insert batch
      await targetCollection.insertMany(batch, { ordered: false });
      totalInserted += batch.length;
      skip += BATCH_SIZE;
      retries = 0; // Reset retries on success
      
      log(`   ✅ Processed ${totalInserted}/${count} documents...`, 'green');
      
    } catch (error) {
      retries++;
      if (retries > MAX_RETRIES) {
        log(`   ❌ Failed after ${MAX_RETRIES} retries at document ${skip}: ${error.message}`, 'red');
        log(`   ⚠️  Continuing from next batch...`, 'yellow');
        skip += BATCH_SIZE; // Skip this batch
        retries = 0;
      } else {
        log(`   ⚠️  Retry ${retries}/${MAX_RETRIES} for batch starting at ${skip}...`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }
  }
  
  log(`   ✅ Completed: ${totalInserted}/${count} documents migrated`, 'green');
}

async function main() {
  const sourceConn = await connect(ATLAS_URI, 'MongoDB Atlas');
  const targetConn = await connect(LOCAL_URI, 'Local MongoDB');
  
  const sourceDb = sourceConn.db;
  const targetDb = targetConn.db;
  
  // Migrate jobs
  await migrateLargeCollection(sourceDb, targetDb, 'jobs');
  
  // Migrate cvs
  await migrateLargeCollection(sourceDb, targetDb, 'cvs');
  
  await sourceConn.close();
  await targetConn.close();
  
  log('\n✅ Large collections migration completed!\n', 'green');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

