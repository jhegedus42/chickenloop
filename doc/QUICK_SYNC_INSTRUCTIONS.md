# 🔄 Quick Sync: Local DB → Vercel

## ✅ Method 1: Via Vercel Dashboard (No CLI needed - RECOMMENDED)

### Step 1: Go to Vercel Environment Variables
👉 **Visit:** https://vercel.com/chickenloop3845-commits-projects/cl1/settings/environment-variables

### Step 2: Add/Update MONGODB_URI

**Name:** `MONGODB_URI`

**Value:** `mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369`

**Environments:** ✅ Production ✅ Preview ✅ Development

Click **"Save"**

### Step 3: Add/Update JWT_SECRET

**Name:** `JWT_SECRET`

**Value:** `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`

**Environments:** ✅ Production ✅ Preview ✅ Development

Click **"Save"**

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

### ✅ Done! Both environments are now synced.

---

## ⚙️ Method 2: Via Vercel CLI (Requires Login)

### Step 1: Login to Vercel
```bash
cd chickenloop
npx vercel login
```
This will open a browser for authentication.

### Step 2: Run Sync Script
```bash
./scripts/quick-sync-vercel.sh
```

The script will:
- ✅ Read your local `.env.local`
- ✅ Update Vercel's environment variables
- ✅ Trigger a redeployment

---

## 🔍 Verify Sync

After syncing, verify both environments use the same database:

### Test 1: Check API
```bash
# Local
curl http://localhost:3000/api/jobs

# Vercel
curl https://cl1-ashen.vercel.app/api/jobs
```

Both should return the same data.

### Test 2: Login with Admin
- Visit: https://cl1-ashen.vercel.app/login
- Email: `rooster@chickenloop.com`
- Password: `Chicken!123`

You should see the same 4 users as locally.

---

## 📝 What "Sync" Means

✅ **Both environments point to the SAME MongoDB database**
✅ **Data added locally = immediately visible in Vercel**
✅ **Data added in Vercel = immediately visible locally**
✅ **No manual data migration needed!**


