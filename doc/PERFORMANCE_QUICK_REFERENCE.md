# Performance Optimization Quick Reference

This document provides quick commands and tips for monitoring and maintaining performance.

## Quick Commands

### Run Performance Tests
```bash
# Run all performance tests
npm test -- __tests__/performance/benchmark.test.ts

# Run comprehensive analysis
npx tsx scripts/performance-analysis.ts

# Run simple benchmark
npx tsx scripts/benchmark-db.ts

# Verify indexes are deployed
npx tsx scripts/check-indexes.ts
```

### Monitor Performance in Production

```javascript
// Check if indexes are being used (MongoDB shell)
db.jobs.find({ published: true }).sort({ createdAt: -1 }).limit(10).explain("executionStats")

// Enable slow query logging (>100ms)
db.setProfilingLevel(1, { slowms: 100 })

// View recent slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty()
```

## Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Connection Time | <2,000ms | <5,000ms |
| Network Latency | <200ms | <500ms |
| Single Query | <200ms | <500ms |
| 100 Doc Query | <500ms | <1,000ms |
| Query Efficiency | >50% | >25% |

## Index Coverage Checklist

### Jobs Collection (9 indexes)
- [x] `_id` (automatic)
- [x] `createdAt: -1`
- [x] `updatedAt: -1`
- [x] `published: 1, createdAt: -1` (compound)
- [x] `featured: 1, published: 1` (compound)
- [x] `recruiter: 1`
- [x] `companyId: 1`
- [x] `country: 1`
- [x] `type: 1`

### Users Collection (5 indexes)
- [x] `_id` (automatic)
- [x] `email: 1` (unique)
- [x] `role: 1`
- [x] `createdAt: -1`
- [x] `lastOnline: -1`

### Companies Collection (4 indexes)
- [x] `_id` (automatic)
- [x] `owner: 1` (unique)
- [x] `featured: 1`
- [x] `createdAt: -1`

### CVs Collection (4 indexes)
- [x] `_id` (automatic)
- [x] `createdAt: -1`
- [x] `published: 1, createdAt: -1` (compound)
- [x] `jobSeeker: 1`

## Common Query Patterns

### Optimized Queries (Use These)

```typescript
// ✅ Good: Using lean() for read-only
const jobs = await Job.find({ published: true })
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();

// ✅ Good: Using index hints
const jobs = await collection.find({ published: true })
  .hint({ published: 1, createdAt: -1 })
  .toArray();

// ✅ Good: Using projection to reduce data transfer
const users = await User.find({ role: 'recruiter' })
  .select('name email')
  .lean();

// ✅ Good: Using Promise.all for concurrent queries
const [jobs, users, companies] = await Promise.all([
  Job.find({}).lean(),
  User.find({}).lean(),
  Company.find({}).lean(),
]);
```

### Anti-Patterns (Avoid These)

```typescript
// ❌ Bad: Not using lean() for read-only
const jobs = await Job.find({}).limit(100); // Creates Mongoose documents

// ❌ Bad: Fetching all fields when only few are needed
const users = await User.find({}); // Gets all fields

// ❌ Bad: Sequential queries instead of Promise.all
const jobs = await Job.find({});
const users = await User.find({}); // Wait for first to complete

// ❌ Bad: Not limiting results
const jobs = await Job.find({}); // Could return thousands

// ❌ Bad: N+1 query pattern
for (const job of jobs) {
  const recruiter = await User.findById(job.recruiter); // Separate query each time!
}
```

## Cache Strategy

### API Routes with Caching
```typescript
import { CachePresets } from '@/lib/cache';

// Public data - 5 minute cache
return NextResponse.json({ data }, { 
  headers: CachePresets.short() // 300s max-age, 60s swr
});

// User-specific - no cache or private short
return NextResponse.json({ data }, { 
  headers: CachePresets.noCache()
});
```

### Cache Presets
- `noCache()` - No caching (user-specific data)
- `short()` - 5 minutes (semi-static public data)
- `medium()` - 1 hour (relatively static)
- `long()` - 24 hours (very static)
- `privateShort()` - 1 minute private (user data that changes rarely)

## Troubleshooting

### Slow Queries
1. Run explain to check if indexes are used:
   ```typescript
   const explain = await Job.find({}).explain('executionStats');
   console.log(explain.executionStats);
   ```

2. Check for:
   - `totalDocsExamined` >> `nReturned` (inefficient)
   - `executionTimeMillis` > 100ms (slow)
   - Missing index in execution plan

### High Memory Usage
1. Use `.lean()` for read-only queries (uses less memory)
2. Use pagination with `.limit()` and `.skip()`
3. Use `.select()` to fetch only needed fields
4. Clear large variables after use

### Connection Issues
1. Check connection pool size:
   ```typescript
   console.log(mongoose.connection.pool.size);
   ```

2. Increase pool if needed (in lib/db.ts):
   ```typescript
   maxPoolSize: 20, // Increase from 15
   ```

## Performance Monitoring Tools

### Built-in Scripts
- `scripts/performance-analysis.ts` - Comprehensive analysis
- `scripts/check-indexes.ts` - Verify index deployment
- `scripts/benchmark-db.ts` - Simple quick benchmark

### Production Monitoring
- Vercel Analytics - Page load times
- MongoDB Atlas - Query performance metrics
- Browser DevTools - Network tab for API timing

## When to Re-run Performance Tests

- ✅ After adding new queries
- ✅ After modifying existing queries
- ✅ After schema changes
- ✅ When data grows significantly
- ✅ Before production deployments
- ✅ When users report slowness

## Optimization Checklist for New Features

When adding new features:

- [ ] Are database queries using appropriate indexes?
- [ ] Are read-only queries using `.lean()`?
- [ ] Are only necessary fields being fetched?
- [ ] Are results limited to reasonable amounts?
- [ ] Is caching appropriate for this data?
- [ ] Are concurrent queries using `Promise.all()`?
- [ ] Did I run performance tests?
- [ ] Did I check the query execution plan?

## Further Optimization Ideas

### If Traffic Increases 10x
1. Add Redis for caching hot data
2. Implement request deduplication
3. Use CDN for static assets (Vercel provides this)
4. Consider read replicas for MongoDB

### If Data Increases 10x
1. Implement pagination on all list endpoints
2. Add search indexes for full-text search
3. Archive old data to separate collection
4. Consider sharding for very large collections

### If Query Times Degrade
1. Review slow query logs
2. Check index usage with explain plans
3. Add compound indexes for common query patterns
4. Consider denormalization for frequently joined data

## Resources

- [Performance Testing Report](doc/PERFORMANCE_TESTING_REPORT.md) - Detailed findings
- [PERFORMANCE_IMPROVEMENTS.md](PERFORMANCE_IMPROVEMENTS.md) - Summary of optimizations
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Mongoose Performance Tips](https://mongoosejs.com/docs/guide.html#indexes)
