# 🚀 Vercel Sync Steps

## Script Created ✅

The sync script is ready: `scripts/sync-vercel-env.sh`

It will sync these values to Vercel:
- **MONGODB_URI:** `mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369`
- **JWT_SECRET:** `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`

---

## Step 1: Login to Vercel CLI

Run this command (it will open a browser):

```bash
cd chickenloop
npx vercel login
```

**What happens:**
1. Command runs and opens your browser
2. You'll see a Vercel login page
3. Login with your Vercel account
4. Browser will show "Success! You can close this tab"
5. Terminal will show "✅ Success! Logged in as [your-email]"

---

## Step 2: Run the Sync Script

After logging in, run:

```bash
./scripts/sync-vercel-env.sh
```

**What it does:**
1. ✅ Verifies you're logged in
2. ✅ Removes old MONGODB_URI from all environments
3. ✅ Adds new MONGODB_URI to Production, Preview, and Development
4. ✅ Removes old JWT_SECRET from all environments
5. ✅ Adds new JWT_SECRET to Production, Preview, and Development
6. ✅ Triggers a production redeployment

---

## Step 3: Verify

After the script completes:

1. **Check deployment:** https://cl1-ashen.vercel.app/
2. **Test login:** https://cl1-ashen.vercel.app/login
   - Email: `rooster@chickenloop.com`
   - Password: `Chicken!123`
3. **Should see:** Same 4 users as locally

---

## Quick Commands

```bash
# 1. Login (interactive - opens browser)
cd chickenloop
npx vercel login

# 2. Sync (after login)
./scripts/sync-vercel-env.sh

# 3. Verify login status
npx vercel whoami
```

---

## Alternative: Use Vercel Dashboard

If you prefer not to use CLI, use the Vercel Dashboard:

1. Go to: https://vercel.com/chickenloop3845-commits-projects/cl1/settings/environment-variables
2. Add/Update environment variables manually
3. Redeploy

See `SYNC_NOW.md` for detailed dashboard instructions.


