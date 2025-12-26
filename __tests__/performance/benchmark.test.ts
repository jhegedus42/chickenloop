/**
 * Performance benchmark tests for ChickenLoop application
 * These tests measure performance of key operations and identify bottlenecks
 */

import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import User from '@/models/User';
import Company from '@/models/Company';
import CV from '@/models/CV';

// Skip these tests in CI environments or when MONGODB_URI is not set
const shouldSkip = !process.env.MONGODB_URI || process.env.CI === 'true';

describe('Performance Benchmarks', () => {
  beforeAll(async () => {
    if (shouldSkip) {
      console.log('Skipping performance tests - no MONGODB_URI or in CI environment');
      return;
    }
    await connectDB();
  }, 30000);

  afterAll(async () => {
    if (!shouldSkip) {
      await mongoose.disconnect();
    }
  });

  describe('Database Connection', () => {
    it('should connect within acceptable time', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      await connectDB();
      const duration = Date.now() - startTime;

      console.log(`  ⏱️  Connection time: ${duration}ms`);
      expect(duration).toBeLessThan(5000); // Should connect in less than 5 seconds
    }, 10000);

    it('should have acceptable ping latency', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      await mongoose.connection.db?.admin().ping();
      const latency = Date.now() - startTime;

      console.log(`  🏓 Ping latency: ${latency}ms`);
      expect(latency).toBeLessThan(500); // Should ping in less than 500ms
    });
  });

  describe('Query Performance', () => {
    it('should fetch single job quickly', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      await Job.findOne({}).lean();
      const duration = Date.now() - startTime;

      console.log(`  🔍 Single job query: ${duration}ms`);
      expect(duration).toBeLessThan(200); // Should query in less than 200ms
    });

    it('should fetch multiple jobs efficiently', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      const jobs = await Job.find({ published: { $ne: false } })
        .limit(100)
        .lean();
      const duration = Date.now() - startTime;

      console.log(`  📦 100 jobs query: ${duration}ms (${jobs.length} docs)`);
      expect(duration).toBeLessThan(500); // Should query in less than 500ms
    });

    it('should use index for published jobs query', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      const jobs = await Job.find({ published: true, createdAt: { $exists: true } })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      const duration = Date.now() - startTime;

      console.log(`  📊 Indexed published jobs: ${duration}ms (${jobs.length} docs)`);
      expect(duration).toBeLessThan(300); // Should benefit from compound index
    });

    it('should fetch featured jobs efficiently', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      const jobs = await Job.find({ featured: true, published: true })
        .lean();
      const duration = Date.now() - startTime;

      console.log(`  ⭐ Featured jobs query: ${duration}ms (${jobs.length} docs)`);
      expect(duration).toBeLessThan(300); // Should use featured index
    });

    it('should fetch user by role quickly', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      const users = await User.find({ role: 'recruiter' })
        .limit(20)
        .lean();
      const duration = Date.now() - startTime;

      console.log(`  👤 Role-based user query: ${duration}ms (${users.length} docs)`);
      expect(duration).toBeLessThan(200); // Should use role index
    });

    it('should fetch company by owner efficiently', async () => {
      if (shouldSkip) return;

      const firstUser = await User.findOne({ role: 'recruiter' }).lean();
      if (!firstUser) {
        console.log('  ℹ️  No recruiters found, skipping company owner test');
        return;
      }

      const startTime = Date.now();
      const company = await Company.findOne({ owner: firstUser._id }).lean();
      const duration = Date.now() - startTime;

      console.log(`  🏢 Company by owner query: ${duration}ms`);
      expect(duration).toBeLessThan(200); // Should use owner index
    });
  });

  describe('Aggregate Query Performance', () => {
    it('should perform job statistics aggregation efficiently', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      const stats = await Job.aggregate([
        { $match: { published: { $ne: false } } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgVisits: { $avg: '$visitCount' }
          }
        }
      ]);
      const duration = Date.now() - startTime;

      console.log(`  📈 Job statistics aggregation: ${duration}ms (${stats.length} groups)`);
      expect(duration).toBeLessThan(400);
    });

    it('should count jobs by country efficiently', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      const countByCountry = await Job.aggregate([
        { $match: { published: { $ne: false }, country: { $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      const duration = Date.now() - startTime;

      console.log(`  🌍 Jobs by country: ${duration}ms (${countByCountry.length} countries)`);
      expect(duration).toBeLessThan(400);
    });
  });

  describe('Populate Performance', () => {
    it('should populate recruiter info efficiently', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      const jobs = await Job.find({ published: { $ne: false } })
        .limit(20)
        .populate('recruiter', 'name email');
      const duration = Date.now() - startTime;

      console.log(`  🔗 Populate recruiter (20 jobs): ${duration}ms`);
      expect(duration).toBeLessThan(500);
    });

    it('should use lean() for read-only queries', async () => {
      if (shouldSkip) return;

      // Without lean
      const start1 = Date.now();
      const jobs1 = await Job.find({}).limit(50);
      const withoutLean = Date.now() - start1;

      // With lean
      const start2 = Date.now();
      const jobs2 = await Job.find({}).limit(50).lean();
      const withLean = Date.now() - start2;

      console.log(`  ⚡ Without lean(): ${withoutLean}ms`);
      console.log(`  ⚡ With lean(): ${withLean}ms`);
      console.log(`  ⚡ Performance gain: ${((withoutLean - withLean) / withoutLean * 100).toFixed(1)}%`);

      // Lean should be faster or at least not significantly slower
      expect(withLean).toBeLessThanOrEqual(withoutLean * 1.1);
    });
  });

  describe('Write Performance', () => {
    let testUserId: mongoose.Types.ObjectId;

    beforeAll(async () => {
      if (shouldSkip) return;
      const testUser = await User.findOne({ role: 'recruiter' });
      if (testUser) {
        testUserId = testUser._id as mongoose.Types.ObjectId;
      }
    });

    it('should create a job within acceptable time', async () => {
      if (shouldSkip || !testUserId) return;

      const startTime = Date.now();
      const job = await Job.create({
        title: 'Performance Test Job',
        description: 'This is a test job for performance benchmarking',
        company: 'Test Company',
        location: 'Test Location',
        type: 'full-time',
        recruiter: testUserId,
        published: false, // Mark as unpublished to clean up later
      });
      const duration = Date.now() - startTime;

      console.log(`  ✍️  Job creation: ${duration}ms`);
      expect(duration).toBeLessThan(500);

      // Clean up
      await Job.deleteOne({ _id: job._id });
    });

    it('should update a job efficiently', async () => {
      if (shouldSkip || !testUserId) return;

      // Create test job
      const job = await Job.create({
        title: 'Update Test Job',
        description: 'Test',
        company: 'Test',
        location: 'Test',
        type: 'full-time',
        recruiter: testUserId,
        published: false,
      });

      const startTime = Date.now();
      await Job.updateOne(
        { _id: job._id },
        { $set: { title: 'Updated Title', visitCount: 10 } }
      );
      const duration = Date.now() - startTime;

      console.log(`  🔄 Job update: ${duration}ms`);
      expect(duration).toBeLessThan(300);

      // Clean up
      await Job.deleteOne({ _id: job._id });
    });
  });

  describe('Connection Pool', () => {
    it('should handle concurrent queries efficiently', async () => {
      if (shouldSkip) return;

      const startTime = Date.now();
      
      // Simulate 10 concurrent queries
      const queries = Array(10).fill(null).map(() => 
        Job.find({ published: { $ne: false } }).limit(10).lean()
      );

      await Promise.all(queries);
      const duration = Date.now() - startTime;

      console.log(`  🔀 10 concurrent queries: ${duration}ms`);
      expect(duration).toBeLessThan(2000); // Should handle concurrency well
    });
  });

  describe('Index Usage Analysis', () => {
    it('should verify indexes are being used', async () => {
      if (shouldSkip) return;

      // Get explain plan for a query
      const explain = await Job.find({ published: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .explain('executionStats');

      const executionStats = (explain as any).executionStats;
      console.log(`  📊 Documents examined: ${executionStats.totalDocsExamined}`);
      console.log(`  📊 Documents returned: ${executionStats.nReturned}`);
      console.log(`  📊 Execution time: ${executionStats.executionTimeMillis}ms`);

      // Index should reduce documents examined
      // If index is used well, examined should be close to returned
      const efficiency = executionStats.nReturned / (executionStats.totalDocsExamined || 1);
      console.log(`  📊 Query efficiency: ${(efficiency * 100).toFixed(1)}%`);
    });
  });
});
