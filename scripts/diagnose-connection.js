const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

// Get connection string
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
    process.exit(1);
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

// Extract hostname from connection string
const hostnameMatch = MONGODB_URI.match(/@([^/]+)\//);
const hostname = hostnameMatch ? hostnameMatch[1] : null;

console.log('🔍 MongoDB Connection Diagnostics');
console.log('==================================\n');

// Test 1: DNS Resolution
async function testDNS() {
  if (!hostname) {
    console.log('⚠️  Could not extract hostname from connection string');
    return;
  }
  
  console.log('1️⃣  Testing DNS Resolution...');
  try {
    const addresses = await Promise.race([
      dns.resolve4(hostname),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 5000))
    ]);
    console.log('   ✅ DNS resolved successfully');
    console.log('   📍 IP addresses:', addresses.join(', '));
    return true;
  } catch (error) {
    console.log('   ❌ DNS resolution failed:', error.message);
    return false;
  }
}

// Test 2: Basic Connection (no options)
async function testBasicConnection() {
  console.log('\n2️⃣  Testing Basic Connection (no options)...');
  const startTime = Date.now();
  
  try {
    await mongoose.connect(MONGODB_URI);
    const elapsed = Date.now() - startTime;
    console.log(`   ✅ Connected in ${elapsed}ms`);
    console.log('   📊 Ready state:', mongoose.connection.readyState);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`   ❌ Connection failed after ${elapsed}ms`);
    console.log('   💥 Error:', error.message);
    return false;
  }
}

// Test 3: Connection with timeout options
async function testConnectionWithTimeouts() {
  console.log('\n3️⃣  Testing Connection with Timeout Options...');
  const startTime = Date.now();
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      maxPoolSize: 1,
    });
    const elapsed = Date.now() - startTime;
    console.log(`   ✅ Connected in ${elapsed}ms`);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`   ❌ Connection failed after ${elapsed}ms`);
    console.log('   💥 Error:', error.message);
    return false;
  }
}

// Test 4: Connection state check
async function testConnectionState() {
  console.log('\n4️⃣  Testing Connection State Management...');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 1,
    });
    
    console.log('   ✅ Connected');
    console.log('   📊 Ready state:', mongoose.connection.readyState);
    console.log('   🔌 Host:', mongoose.connection.host);
    console.log('   📦 Database:', mongoose.connection.db?.databaseName);
    
    // Test a simple query
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const elapsed = Date.now() - startTime;
    console.log(`   ✅ Ping successful in ${elapsed}ms`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore
    }
    return false;
  }
}

// Test 5: Multiple rapid connections (simulating Next.js behavior)
async function testRapidConnections() {
  console.log('\n5️⃣  Testing Rapid Connection Pattern (Next.js simulation)...');
  
  const connections = [];
  const startTime = Date.now();
  
  try {
    // Simulate 3 rapid connection attempts (like Next.js might do)
    for (let i = 0; i < 3; i++) {
      const connStart = Date.now();
      try {
        await mongoose.connect(MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 1,
        });
        const connElapsed = Date.now() - connStart;
        console.log(`   ✅ Connection ${i + 1}: ${connElapsed}ms`);
        connections.push(mongoose.connection);
        
        // Small delay between connections
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`   ❌ Connection ${i + 1} failed:`, error.message);
      }
    }
    
    // Clean up
    for (const conn of connections) {
      try {
        await conn.close();
      } catch (e) {
        // Ignore
      }
    }
    
    const totalElapsed = Date.now() - startTime;
    console.log(`   ⏱️  Total time: ${totalElapsed}ms`);
    return true;
  } catch (error) {
    console.log('   ❌ Test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  const results = {
    dns: false,
    basic: false,
    withTimeouts: false,
    connectionState: false,
    rapidConnections: false,
  };
  
  try {
    results.dns = await testDNS();
    results.basic = await testBasicConnection();
    results.withTimeouts = await testConnectionWithTimeouts();
    results.connectionState = await testConnectionState();
    results.rapidConnections = await testRapidConnections();
    
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log('DNS Resolution:', results.dns ? '✅' : '❌');
    console.log('Basic Connection:', results.basic ? '✅' : '❌');
    console.log('Connection with Timeouts:', results.withTimeouts ? '✅' : '❌');
    console.log('Connection State:', results.connectionState ? '✅' : '❌');
    console.log('Rapid Connections:', results.rapidConnections ? '✅' : '❌');
    
    console.log('\n💡 Recommendations:');
    if (!results.dns) {
      console.log('   - DNS resolution failed. Check network connectivity.');
    }
    if (!results.basic && results.dns) {
      console.log('   - Basic connection failed despite DNS working. Check MongoDB Atlas network access.');
    }
    if (results.basic && !results.withTimeouts) {
      console.log('   - Connection works without options but fails with timeouts. Timeout values may be too low.');
    }
    if (results.basic && !results.rapidConnections) {
      console.log('   - Single connection works but rapid connections fail. May indicate connection limit or pooling issue.');
    }
    
  } catch (error) {
    console.error('\n❌ Diagnostic error:', error);
  } finally {
    // Ensure all connections are closed
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (e) {
      // Ignore
    }
  }
}

runDiagnostics();

