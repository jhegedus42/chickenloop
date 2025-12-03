const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to read MONGODB_URI from .env.local
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/MONGODB_URI=(.+)/);
      if (match) {
        MONGODB_URI = match[1].trim();
      }
    }
  } catch (err) {
    console.error('Could not read .env.local file:', err.message);
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment or .env.local file');
  console.log('\nPlease check:');
  console.log('1. Does .env.local exist in the project root?');
  console.log('2. Does it contain MONGODB_URI=...?');
  process.exit(1);
}

console.log('🔍 Testing database connection...');
console.log('📍 Connection string found (length:', MONGODB_URI.length, 'characters)');
console.log('🔗 Connection string starts with:', MONGODB_URI.substring(0, 30) + '...\n');

// Test connection with timeout
const connectionTimeout = 10000; // 10 seconds
const startTime = Date.now();

const connectPromise = mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: connectionTimeout,
  socketTimeoutMS: connectionTimeout,
});

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    reject(new Error(`Connection timeout after ${connectionTimeout}ms`));
  }, connectionTimeout);
});

Promise.race([connectPromise, timeoutPromise])
  .then(() => {
    const elapsed = Date.now() - startTime;
    console.log('✅ Database connection successful!');
    console.log('⏱️  Connection time:', elapsed, 'ms');
    console.log('📊 Database name:', mongoose.connection.db?.databaseName || 'Unknown');
    console.log('🔌 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Unknown');
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful!');
    console.log('\n🎉 Database connection is working correctly.');
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((error) => {
    const elapsed = Date.now() - startTime;
    console.error('❌ Database connection failed!');
    console.error('⏱️  Time elapsed:', elapsed, 'ms');
    console.error('💥 Error:', error.message);
    
    if (error.message.includes('timeout')) {
      console.error('\n🔍 Possible issues:');
      console.error('1. MongoDB server is not accessible from your network');
      console.error('2. Firewall is blocking the connection');
      console.error('3. MongoDB connection string is incorrect');
      console.error('4. MongoDB cluster/instance is down');
    } else if (error.message.includes('authentication')) {
      console.error('\n🔍 Possible issues:');
      console.error('1. Username or password is incorrect');
      console.error('2. Database user does not have proper permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('\n🔍 Possible issues:');
      console.error('1. MongoDB hostname cannot be resolved');
      console.error('2. Network connectivity issue');
    }
    
    process.exit(1);
  });

