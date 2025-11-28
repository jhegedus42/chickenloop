# 🔄 Syncing Local Database with Vercel

## Understanding Database Sync

**Good news:** If both local and Vercel use the same `MONGODB_URI`, they're already synced! They share the same database, so any data added locally will immediately be visible in Vercel and vice versa.

**The key:** Ensure both environments have the same `MONGODB_URI` environment variable.

---

## Current Setup

### Local Database
- **Connection String:** `mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369`
- **Environment File:** `.env.local`
- **Current Users:** 4 (including admin "Rooster")
- **Jobs:** 0
- **Companies:** 0

### Vercel Database
- **Status:** Need to verify environment variables
- **URL:** https://cl1-ashen.vercel.app/

---

## Method 1: Sync Using Script (Easiest) ✅

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Run the sync script**:
   ```bash
   cd chickenloop
   ./scripts/sync-vercel-db.sh
   ```

   This script will:
   - Read your local `.env.local` file
   - Update Vercel's `MONGODB_URI` to match local
   - Update Vercel's `JWT_SECRET` to match local
   - Trigger a redeployment

---

## Method 2: Manual Sync via Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/chickenloop3845-commits-projects/cl1/settings/environment-variables

2. **Add/Update Environment Variables:**

   **Variable 1: MONGODB_URI**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2: JWT_SECRET**
   - Name: `JWT_SECRET`
   - Value: `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **Save** the environment variables

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"..."** on the latest deployment
   - Click **"Redeploy"**

---

## Method 3: Manual Sync via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Remove old environment variables** (optional):
   ```bash
   vercel env rm MONGODB_URI production --yes
   vercel env rm MONGODB_URI preview --yes
   vercel env rm MONGODB_URI development --yes
   ```

3. **Add MONGODB_URI**:
   ```bash
   echo "mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369" | vercel env add MONGODB_URI production
   echo "mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369" | vercel env add MONGODB_URI preview
   echo "mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369" | vercel env add MONGODB_URI development
   ```

4. **Add JWT_SECRET** (if needed):
   ```bash
   echo "2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=" | vercel env add JWT_SECRET production
   echo "2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=" | vercel env add JWT_SECRET preview
   echo "2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=" | vercel env add JWT_SECRET development
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

---

## Verify Sync

After syncing, verify that both environments are using the same database:

### 1. Check Vercel API:
```bash
curl https://cl1-ashen.vercel.app/api/jobs
# Should return the same data as local API
```

### 2. Check Users Count:
```bash
# Local
node scripts/read-all-data.js

# Should match what you see in Vercel admin panel
```

### 3. Test Login:
- Visit: https://cl1-ashen.vercel.app/login
- Login with admin credentials: `rooster@chickenloop.com` / `Chicken!123`
- Should see the same users/data as locally

---

## Important Notes

### ✅ What "Sync" Means:
- Both environments point to the **same MongoDB Atlas database**
- Any data added **locally** will be **immediately visible** in Vercel
- Any data added **in Vercel** will be **immediately visible** locally
- **No manual data migration needed** - they share the same database!

### ⚠️ Important:
- Both environments must use the **exact same connection string**
- After updating environment variables, **redeploy** Vercel for changes to take effect
- Environment variable changes require a **new deployment** to be active

### 🔐 Security:
- Keep your `MONGODB_URI` and `JWT_SECRET` secure
- Never commit `.env.local` to git
- Use Vercel's environment variables for production secrets

---

## Troubleshooting

### "Connection refused" or "Database not found"
- Verify `MONGODB_URI` is correct in both environments
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify database name is `/chickenloop` in connection string

### "Environment variables not working"
- After updating, **redeploy** Vercel (changes require new deployment)
- Verify environment variables are set for **all environments** (production, preview, development)
- Check variable names are exact: `MONGODB_URI` and `JWT_SECRET`

### "Different data in local vs Vercel"
- They might be pointing to **different databases**
- Check connection strings match exactly
- Verify both are connecting to the same cluster: `cluster042369.iggtazi.mongodb.net`

---

## Quick Reference

**Local Connection String:**
```
mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369
```

**Vercel Dashboard:**
- https://vercel.com/chickenloop3845-commits-projects/cl1/settings/environment-variables

**Vercel Deployment:**
- https://cl1-ashen.vercel.app/

**Sync Script:**
```bash
./scripts/sync-vercel-db.sh
```


