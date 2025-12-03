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
    console.error('Could not read .env.local file');
  }
}

// Fallback to hardcoded URI (from read-all-data.js)
if (!MONGODB_URI) {
  MONGODB_URI = 'mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369';
  console.log('Using fallback connection string\n');
}

// Define schemas inline (since models are TypeScript)
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

const AuditLogSchema = new mongoose.Schema({
  action: String,
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  userEmail: String,
  userName: String,
  changes: mongoose.Schema.Types.Mixed,
  reason: String,
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

async function checkJobs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!\n');

    // Count all jobs
    const totalJobs = await Job.countDocuments({});
    console.log('='.repeat(80));
    console.log('JOB COUNT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total jobs in database: ${totalJobs}\n`);

    // Count by published status
    const publishedJobs = await Job.countDocuments({ published: true });
    const unpublishedJobs = await Job.countDocuments({ published: false });
    const noPublishedField = await Job.countDocuments({ published: { $exists: false } });
    
    console.log('Published status breakdown:');
    console.log(`  - Published (published: true): ${publishedJobs}`);
    console.log(`  - Unpublished (published: false): ${unpublishedJobs}`);
    console.log(`  - No published field: ${noPublishedField}\n`);

    // Get all jobs with details
    const allJobs = await Job.find()
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    if (allJobs.length > 0) {
      console.log('='.repeat(80));
      console.log('ALL JOBS IN DATABASE:');
      console.log('='.repeat(80));
      allJobs.forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Published: ${job.published !== false ? 'Yes' : 'No'}`);
        console.log(`   Recruiter: ${job.recruiter?.name || 'Unknown'} (${job.recruiter?.email || 'Unknown'})`);
        console.log(`   ID: ${job._id}`);
        console.log(`   Created: ${job.createdAt}`);
        console.log(`   Updated: ${job.updatedAt}`);
      });
    } else {
      console.log('No jobs found in database.\n');
    }

    // Check audit logs for job deletions
    console.log('\n' + '='.repeat(80));
    console.log('AUDIT LOGS - JOB DELETIONS:');
    console.log('='.repeat(80));
    
    const deletionLogs = await AuditLog.find({
      entityType: 'job',
      action: 'delete'
    })
    .sort({ createdAt: -1 })
    .lean();

    if (deletionLogs.length > 0) {
      console.log(`Found ${deletionLogs.length} job deletion(s) in audit logs:\n`);
      deletionLogs.forEach((log, index) => {
        console.log(`${index + 1}. Deleted at: ${log.createdAt}`);
        console.log(`   Deleted by: ${log.userName} (${log.userEmail})`);
        console.log(`   Job ID: ${log.entityId}`);
        if (log.reason) {
          console.log(`   Reason: ${log.reason}`);
        }
        if (log.changes?.before) {
          console.log(`   Job title: ${log.changes.before.title || 'Unknown'}`);
          console.log(`   Company: ${log.changes.before.company || 'Unknown'}`);
        }
        console.log('');
      });
    } else {
      console.log('No job deletion records found in audit logs.\n');
    }

    // Check for bulk deletions (company or user deletions that would delete jobs)
    console.log('='.repeat(80));
    console.log('AUDIT LOGS - BULK DELETIONS (Company/User deletions that may have deleted jobs):');
    console.log('='.repeat(80));
    
    const bulkDeletions = await AuditLog.find({
      $or: [
        { entityType: 'company', action: 'delete' },
        { entityType: 'user', action: 'delete' }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    if (bulkDeletions.length > 0) {
      console.log(`Found ${bulkDeletions.length} company/user deletion(s) that may have deleted associated jobs:\n`);
      bulkDeletions.forEach((log, index) => {
        console.log(`${index + 1}. Deleted at: ${log.createdAt}`);
        console.log(`   Type: ${log.entityType}`);
        console.log(`   Deleted by: ${log.userName} (${log.userEmail})`);
        console.log(`   Entity ID: ${log.entityId}`);
        if (log.reason) {
          console.log(`   Reason: ${log.reason}`);
        }
        if (log.metadata?.jobsDeleted) {
          console.log(`   ⚠️  Jobs deleted: ${log.metadata.jobsDeleted}`);
        }
        if (log.changes?.before) {
          if (log.entityType === 'company') {
            console.log(`   Company name: ${log.changes.before.name || 'Unknown'}`);
          } else if (log.entityType === 'user') {
            console.log(`   User name: ${log.changes.before.name || 'Unknown'}`);
            console.log(`   User role: ${log.changes.before.role || 'Unknown'}`);
          }
        }
        console.log('');
      });
    } else {
      console.log('No bulk deletion records found.\n');
    }

    // Check for recent job updates that might have unpublished jobs
    console.log('='.repeat(80));
    console.log('RECENT JOB UPDATES (last 20):');
    console.log('='.repeat(80));
    
    const recentUpdates = await AuditLog.find({
      entityType: 'job',
      action: 'update'
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    if (recentUpdates.length > 0) {
      recentUpdates.forEach((log, index) => {
        console.log(`${index + 1}. Updated at: ${log.createdAt}`);
        console.log(`   Updated by: ${log.userName} (${log.userEmail})`);
        console.log(`   Job ID: ${log.entityId}`);
        if (log.changes?.fields?.includes('published')) {
          console.log(`   ⚠️  Published status changed!`);
          if (log.changes.before) console.log(`   Before: published=${log.changes.before.published}`);
          if (log.changes.after) console.log(`   After: published=${log.changes.after.published}`);
        }
        console.log('');
      });
    } else {
      console.log('No recent job update records found.\n');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkJobs();

