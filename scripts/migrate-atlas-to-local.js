#!/usr/bin/env node

/**
 * MongoDB Atlas to Local Migration Script
 * Uses Node.js and mongoose to migrate data without requiring mongodump/mongorestore
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Colors for console output
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

// Get connection strings
const ATLAS_URI = process.env.ATLAS_URI || 'mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369';
const LOCAL_URI = process.env.LOCAL_URI || 'mongodb://localhost:27017/chickenloop';

const collections = ['users', 'jobs', 'companies', 'cvs', 'auditlogs', 'cookieconsents'];

async function connect(uri, name) {
  log(`\n🔌 Connecting to ${name}...`, 'blue');
  try {
    const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: isLocal ? 10000 : 60000,
      socketTimeoutMS: isLocal ? 30000 : 120000, // Longer timeout for Atlas
      connectTimeoutMS: isLocal ? 5000 : 30000,
      directConnection: isLocal ? true : false,
    }).asPromise();
    log(`✅ Connected to ${name}`, 'green');
    return conn;
  } catch (error) {
    log(`❌ Failed to connect to ${name}: ${error.message}`, 'red');
    throw error;
  }
}

async function migrateCollection(sourceDb, targetDb, collectionName) {
  log(`\n📦 Migrating collection: ${collectionName}...`, 'blue');
  
  try {
    const sourceCollection = sourceDb.collection(collectionName);
    const targetCollection = targetDb.collection(collectionName);
    
    // Count documents
    const count = await sourceCollection.countDocuments();
    log(`   Found ${count} documents`, 'yellow');
    
    if (count === 0) {
      log(`   ⏭️  Skipping empty collection`, 'yellow');
      return { collection: collectionName, count: 0, status: 'skipped' };
    }
    
    // Drop target collection if it exists
    try {
      await targetCollection.drop();
      log(`   🗑️  Dropped existing collection`, 'yellow');
    } catch (e) {
      // Collection doesn't exist, that's fine
    }
    
    // For large collections, process in batches
    const BATCH_SIZE = 50;
    let totalInserted = 0;
    let skip = 0;
    
    log(`   📥 Fetching documents in batches of ${BATCH_SIZE}...`, 'yellow');
    
    while (skip < count) {
      const batch = await sourceCollection
        .find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .toArray();
      
      if (batch.length === 0) break;
      
      await targetCollection.insertMany(batch, { ordered: false });
      totalInserted += batch.length;
      skip += BATCH_SIZE;
      
      log(`   📥 Processed ${totalInserted}/${count} documents...`, 'yellow');
    }
    
    log(`   ✅ Inserted ${totalInserted} documents`, 'green');
    
    return { collection: collectionName, count: totalInserted, status: 'success' };
  } catch (error) {
    log(`   ❌ Error migrating ${collectionName}: ${error.message}`, 'red');
    return { collection: collectionName, count: 0, status: 'error', error: error.message };
  }
}

async function main() {
  log('\n🔄 MongoDB Atlas to Local Migration', 'blue');
  log('=====================================\n', 'blue');
  
  log(`Source (Atlas): ${ATLAS_URI.substring(0, 50)}...`, 'yellow');
  log(`Destination (Local): ${LOCAL_URI}\n`, 'yellow');
  
  let sourceConn = null;
  let targetConn = null;
  
  try {
    // Connect to both databases
    sourceConn = await connect(ATLAS_URI, 'MongoDB Atlas');
    targetConn = await connect(LOCAL_URI, 'Local MongoDB');
    
    // Get database names
    const sourceDb = sourceConn.db;
    const targetDb = targetConn.db;
    
    log(`\n📊 Source database: ${sourceDb.databaseName}`, 'blue');
    log(`📊 Target database: ${targetDb.databaseName}\n`, 'blue');
    
    // Migrate each collection
    const results = [];
    for (const collection of collections) {
      const result = await migrateCollection(sourceDb, targetDb, collection);
      results.push(result);
    }
    
    // Summary
    log('\n📊 Migration Summary', 'blue');
    log('===================\n', 'blue');
    
    let totalMigrated = 0;
    results.forEach(result => {
      if (result.status === 'success') {
        log(`✅ ${result.collection}: ${result.count} documents`, 'green');
        totalMigrated += result.count;
      } else if (result.status === 'skipped') {
        log(`⏭️  ${result.collection}: skipped (empty)`, 'yellow');
      } else {
        log(`❌ ${result.collection}: failed - ${result.error}`, 'red');
      }
    });
    
    log(`\n✅ Total documents migrated: ${totalMigrated}`, 'green');
    log('\n🎉 Migration completed successfully!\n', 'green');
    
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    // Close connections
    if (sourceConn) {
      await sourceConn.close();
      log('🔌 Closed Atlas connection', 'yellow');
    }
    if (targetConn) {
      await targetConn.close();
      log('🔌 Closed local connection', 'yellow');
    }
  }
}

// Run migration
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

