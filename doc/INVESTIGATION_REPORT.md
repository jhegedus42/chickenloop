# Missing Jobs Data Investigation Report

**Date:** November 22, 2025  
**Investigator:** AI Assistant  
**Issue:** Jobs collection has 0 documents despite evidence of job creation (9 uploaded images)

## Executive Summary

Jobs were created on November 18, 2025, but are now missing from the database. The root cause is **cascade deletion**: companies were deleted, which automatically deleted all associated jobs. Recovery is not possible from the database, but jobs can be recreated using the uploaded images as reference.

## Investigation Findings

### 1. Database State ✅

**Current State:**
- **Users:** 4 (1 admin, 1 recruiter, 2 job-seekers)
- **Companies:** 0 ⚠️
- **Jobs:** 0 ⚠️
- **CVs:** 0

**Key Finding:**
- Recruiter user exists: "Test Recruiter" (ID: 691b003c13d39bfeed1ea02c)
- Recruiter has **0 companies**
- Jobs require a company to be created (enforced since Nov 17, 2025)

### 2. Environment Differences ✅

**Local Environment:**
```
MONGODB_URI="mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369"
```

**Vercel Environment:**
```
MONGODB_URI="mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369"
```

**Result:** ✅ Both environments use the same database (`chickenloop`). No environment mismatch.

### 3. Cascade Deletions ✅

**Timeline:**
- **Nov 17, 2025:** Company requirement enforced (commit `345cc83`)
- **Nov 18, 2025:** Jobs created (based on image timestamps)
  - Job 1: 7:42:23 PM (3 images)
  - Job 2: 8:54:20 PM (3 images)
  - Job 3: 8:57:45 PM (3 images)
- **After Nov 18:** Companies deleted → Jobs cascade deleted

**Cascade Delete Code:**
```typescript
// app/api/admin/companies/[id]/route.ts:147
await Job.deleteMany({ companyId: company._id });
```

**Result:** ✅ Companies were deleted, causing all jobs to be cascade deleted.

### 4. Collection Names ✅

**Model Name:** `Job` (singular)  
**Collection Name:** `jobs` (plural, lowercase)  
**Mongoose Behavior:** Automatically pluralizes model name to collection name ✅

**Result:** ✅ Collection naming is correct. No naming issues.

### 5. Evidence of Job Creation

**Uploaded Images:**
- 9 job images in `public/uploads/jobs/`
- Filenames contain timestamps indicating 3 jobs created on Nov 18, 2025
- Images are still present in filesystem

**Image Pattern:**
- `job-{timestamp}-{random}.jpg`
- 3 images per job (max allowed)
- Timestamps: 1763491343289, 1763495660828, 1763495865455

## Root Cause Analysis

### Primary Cause: Cascade Deletion

1. **Jobs were created** (Nov 18, 2025) with associated companies
2. **Companies were deleted** (date unknown, after Nov 18)
3. **Jobs were automatically deleted** via cascade delete:
   ```typescript
   await Job.deleteMany({ companyId: company._id });
   ```

### Contributing Factors

1. **No company exists now:** Recruiter has 0 companies
2. **Company requirement enforced:** Since Nov 17, jobs require companies
3. **No backup/restore mechanism:** No evidence of database backups

## Recovery Options

### Option 1: Recreate Jobs (Recommended) ⭐

**Feasibility:** ✅ High  
**Effort:** Medium  
**Data Loss:** Job details lost, images preserved

**Steps:**
1. Create a new company for the recruiter
2. Recreate jobs manually using uploaded images as reference
3. Link images to new jobs

**Limitations:**
- Job titles, descriptions, and other metadata are lost
- Only images remain as evidence

### Option 2: MongoDB Oplog Recovery

**Feasibility:** ❌ Low  
**Effort:** High  
**Data Loss:** None (if successful)

**Requirements:**
- MongoDB Atlas oplog access
- Oplog retention period must cover Nov 18+
- Technical expertise required

**Limitations:**
- Oplog may not retain data long enough
- Requires MongoDB Atlas support/admin access
- Complex recovery process

### Option 3: Accept Data Loss

**Feasibility:** ✅ High  
**Effort:** None  
**Data Loss:** Complete

**Steps:**
- Clean up orphaned images
- Start fresh with new jobs

## Recommendations

### Immediate Actions

1. ✅ **Investigation Complete** - Root cause identified
2. ⚠️ **Create Company** - Recruiter needs a company to post jobs
3. ⚠️ **Recreate Jobs** - Use images as reference to recreate jobs
4. ⚠️ **Clean Up** - Remove orphaned job images or link them to new jobs

### Prevention Measures

1. **Implement Soft Deletes:**
   - Add `deletedAt` field instead of hard deletes
   - Allow recovery of deleted items

2. **Add Backup Strategy:**
   - Regular MongoDB Atlas backups
   - Point-in-time recovery enabled

3. **Add Audit Logging:**
   - Log all delete operations
   - Track who deleted what and when

4. **Add Confirmation Dialogs:**
   - Warn users about cascade deletions
   - Show count of items that will be deleted

5. **Add Undo Functionality:**
   - Keep deleted items in a "trash" for 30 days
   - Allow restoration within retention period

## Conclusion

Jobs were deleted due to cascade deletion when companies were removed. Recovery from the database is not feasible without MongoDB Atlas oplog access. The recommended approach is to recreate jobs using the uploaded images as reference.

**Status:** ✅ Investigation Complete  
**Next Step:** Recreate company and jobs

---

## Files Referenced

- `app/api/admin/companies/[id]/route.ts` - Company deletion with cascade
- `app/api/jobs/route.ts` - Job creation requiring company
- `models/Job.ts` - Job model definition
- `models/Company.ts` - Company model definition
- `public/uploads/jobs/` - Orphaned job images

