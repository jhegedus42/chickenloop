# 🔄 SYNC NOW: Local DB → Vercel

## ✅ VALUES TO USE (From Your Local .env.local)

### MONGODB_URI:
```
mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369
```

### JWT_SECRET:
```
2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=
```

---

## 🚀 METHOD 1: Via Vercel Dashboard (FASTEST - 2 minutes)

### Steps:
1. **Go to:** https://vercel.com/chickenloop3845-commits-projects/cl1/settings/environment-variables

2. **Update MONGODB_URI:**
   - Find `MONGODB_URI` (or click "Add New")
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**

3. **Update JWT_SECRET:**
   - Find `JWT_SECRET` (or click "Add New")
   - **Name:** `JWT_SECRET`
   - **Value:** `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`
   - **Environments:** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**

4. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**

### ✅ Done! Both environments are synced.

---

## ⚙️ METHOD 2: Via Vercel CLI (Requires Login)

### Step 1: Login to Vercel
```bash
cd chickenloop
npx vercel login
```
(This will open a browser for authentication)

### Step 2: Run Sync Script
```bash
./scripts/quick-sync-vercel.sh
```

---

## 📊 What Happens After Sync

✅ **Local and Vercel use the SAME MongoDB database**
✅ **Any data added locally → immediately visible in Vercel**
✅ **Any data added in Vercel → immediately visible locally**
✅ **No manual data migration needed!**

### Verify:
- Visit: https://cl1-ashen.vercel.app/login
- Login with: `rooster@chickenloop.com` / `Chicken!123`
- Should see the same 4 users as locally


