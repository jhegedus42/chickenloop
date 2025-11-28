# How to Add Friend to Vercel Project

## ⚠️ Important: Vercel Plan Limitation

**Current Status:** Your Vercel account is on the **Hobby Plan (Free)**, which does **NOT** allow team members.

**Error when trying to add:** "Team members are not permitted on the Hobby Plan"

## Solutions

### Option 1: Upgrade to Pro Team (Recommended for Collaboration)
- **Cost:** $20/month per team member
- **Benefits:** Full team collaboration, shared projects
- **Upgrade:** https://vercel.com/teams/chickenloop3845-commits-projects/settings/billing
- **After upgrade:** Use the steps below to add team member

### Option 2: Friend Creates Own Vercel Project (Free Alternative) ⭐

Since your friend is already a GitHub collaborator, they can deploy their own Vercel project:

1. **Friend signs up for Vercel:**
   - Go to: https://vercel.com/signup
   - Sign up with: `sven.kelling@gmail.com`
   - Connect GitHub account

2. **Friend imports the repository:**
   - Go to: https://vercel.com/new
   - Import: `chickenloop3845-commits/chickenloop`
   - Vercel will auto-detect Next.js settings

3. **Friend adds environment variables:**
   - In Vercel project settings → Environment Variables
   - Add `MONGODB_URI`: `mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369`
   - Add `JWT_SECRET`: (get from project owner or generate new one)

4. **Deploy:**
   - Click "Deploy"
   - Friend will have their own Vercel deployment URL
   - Both deployments use the same database

**Result:** Friend has their own Vercel project, same code, same database

### Option 3: Share Vercel Account (Not Recommended)
- Share your Vercel login credentials
- Security risk - not recommended

## If You Upgrade to Pro Team

After upgrading, you can add team members:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select project: **`cl1`**

2. **Navigate to Project Settings:**
   - Go to **Settings** → **General**

3. **Add Team Member:**
   - Scroll to **"Team Members"** section
   - Click **"Invite"** button
   - Enter email: **`sven.kelling@gmail.com`**
   - Select permission: **Developer**
   - Click **"Send Invitation"**

4. **Friend Accepts:**
   - Friend receives email invitation
   - They accept and can access the project

## Direct Link

**Project Settings:**
https://vercel.com/chickenloop3845-commits-projects/cl1/settings/general

**Team Members Section:**
https://vercel.com/chickenloop3845-commits-projects/cl1/settings/members

## What Friend Can Do After Being Added

- ✅ View all deployments
- ✅ Access deployment logs
- ✅ View environment variables (if Developer/Owner)
- ✅ Deploy new versions
- ✅ Access the same deployed site URL

## Alternative: Via Vercel CLI

If you have Vercel CLI installed and logged in:

```bash
# Check current project
vercel project ls

# Note: Vercel CLI doesn't have direct team member commands
# Use the dashboard method above instead
```

## Important Notes

1. **Environment Variables:** Friend will see `MONGODB_URI` and `JWT_SECRET` if given Developer/Owner access
2. **GitHub Access:** Friend still needs separate GitHub access to push code (already added as collaborator)
3. **Same Database:** Friend will use the same MongoDB database (shared connection)

## Friend's Email

**Email to invite:** `sven.kelling@gmail.com` (Tzwengali)

---

**Status:** Ready to add - just follow steps 1-4 above!

