const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

// Define Job schema
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: String,
  companyId: mongoose.Schema.Types.ObjectId,
  location: String,
  country: String,
  salary: String,
  type: String,
  languages: [String],
  qualifications: [String],
  sports: [String],
  occupationalAreas: [String],
  pictures: [String],
  spam: String,
  published: Boolean,
  featured: Boolean,
  applyByEmail: Boolean,
  applyByWebsite: Boolean,
  applyByWhatsApp: Boolean,
  applicationEmail: String,
  applicationWebsite: String,
  applicationWhatsApp: String,
  visitCount: Number,
  recruiter: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

async function checkIndexes() {
  try {
    console.log('🔍 Checking MongoDB Indexes for Jobs Collection\n');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 1,
    });
    
    console.log('✅ Connected to database\n');
    
    // Get indexes
    const indexes = await Job.collection.getIndexes();
    
    console.log('📊 Current Indexes:');
    console.log('==================');
    for (const [name, spec] of Object.entries(indexes)) {
      console.log(`\nIndex: ${name}`);
      console.log('  Spec:', JSON.stringify(spec, null, 2));
    }
    
    // Check if published index exists
    const hasPublishedIndex = Object.keys(indexes).some(key => 
      indexes[key].published !== undefined
    );
    
    // Check if createdAt index exists
    const hasCreatedAtIndex = Object.keys(indexes).some(key => 
      indexes[key].createdAt !== undefined || indexes[key]['createdAt'] !== undefined
    );
    
    console.log('\n\n🔍 Index Analysis:');
    console.log('==================');
    console.log('Published field indexed:', hasPublishedIndex ? '✅' : '❌');
    console.log('CreatedAt field indexed:', hasCreatedAtIndex ? '✅' : '❌');
    
    if (!hasPublishedIndex) {
      console.log('\n⚠️  WARNING: No index on "published" field!');
      console.log('   This can cause slow queries. Consider adding an index.');
    }
    
    if (!hasCreatedAtIndex) {
      console.log('\n⚠️  WARNING: No index on "createdAt" field!');
      console.log('   Sorting by createdAt will be slow. Consider adding an index.');
    }
    
    // Test query performance
    console.log('\n\n⏱️  Testing Query Performance:');
    console.log('==============================');
    
    const testQueries = [
      { name: 'Count all jobs', query: () => Job.countDocuments({}) },
      { name: 'Count published jobs', query: () => Job.countDocuments({ published: { $ne: false } }) },
      { name: 'Find 10 jobs (no sort)', query: () => Job.find({}).limit(10).lean() },
      { name: 'Find 10 jobs (sorted)', query: () => Job.find({}).sort({ createdAt: -1 }).limit(10).lean() },
    ];
    
    for (const test of testQueries) {
      const start = Date.now();
      try {
        await test.query();
        const elapsed = Date.now() - start;
        console.log(`  ${test.name}: ${elapsed}ms ${elapsed > 1000 ? '⚠️  SLOW' : '✅'}`);
      } catch (error) {
        console.log(`  ${test.name}: ❌ ERROR - ${error.message}`);
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkIndexes();

