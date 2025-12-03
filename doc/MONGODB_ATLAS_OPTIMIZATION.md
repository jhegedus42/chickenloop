# MongoDB Atlas Optimization for Development

If you prefer to keep using MongoDB Atlas (cloud) instead of local MongoDB, here are optimizations to fix timeout issues.

## Quick Fix: Optimize Connection Settings

Update your `.env.local` with optimized connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chickenloop?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&socketTimeoutMS=45000&connectTimeoutMS=10000
```

## Connection String Parameters Explained

- `maxPoolSize=10` - Limits connection pool (prevents connection exhaustion)
- `serverSelectionTimeoutMS=5000` - Faster failure detection
- `socketTimeoutMS=45000` - Prevents long-hanging queries
- `connectTimeoutMS=10000` - Faster connection attempts

## Atlas Tier Recommendations

### Free Tier (M0)
- **Limitations:** 512MB storage, shared resources
- **Best for:** Very light development
- **Issues:** Can timeout with complex queries

### Shared Tier (M2/M5)
- **Better:** More resources, less timeout issues
- **Cost:** ~$9-25/month
- **Recommended for:** Active development

### Dedicated Tier (M10+)
- **Best:** Dedicated resources, no timeouts
- **Cost:** ~$57+/month
- **Best for:** Production or heavy development

## Code Optimizations Already Applied

We've already optimized your code:
- ✅ Added query timeouts
- ✅ Limited result sets (200 records max)
- ✅ Simplified aggregation queries
- ✅ Added connection pooling settings

## Alternative: Use Local MongoDB

For development, local MongoDB is still recommended:
- ✅ No network latency
- ✅ No connection limits
- ✅ Free
- ✅ Works offline

See `LOCAL_MONGODB_SETUP.md` for local setup instructions.

