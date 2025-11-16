# MongoDB Atlas Setup Guide

## Quick Setup (5-10 minutes)

### Step 1: Create Account & Cluster

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with your email (or sign in if you have an account)
3. **Verify your email** (check inbox)
4. **Create a Free Cluster**:
   - Click "Build a Database"
   - Select **M0 FREE** tier (free forever)
   - Choose cloud provider (AWS, Google Cloud, or Azure)
   - Select region closest to you
   - Cluster name: `chickenloop` (or leave default)
   - Click **"Create"** (takes 3-5 minutes)

### Step 2: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter:
   - **Username**: `chickenloop-user` (or your choice)
   - **Password**: Click "Autogenerate Secure Password" or create your own
   - **⚠️ SAVE THESE CREDENTIALS!** You'll need them
5. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
   - This allows Vercel to connect to your database
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace** `<username>` with your database username
6. **Replace** `<password>` with your database password
7. **Add** `/chickenloop` before the `?` to specify database name

**Final connection string should look like:**
```
mongodb+srv://chickenloop-user:yourpassword@cluster0.xxxxx.mongodb.net/chickenloop?retryWrites=true&w=majority
```

### Step 5: Update Vercel Environment Variable

**Option A: Using Script (Easiest)**
```bash
./setup-mongodb.sh
```
Follow the prompts and paste your connection string.

**Option B: Using Vercel CLI**
```bash
# Remove old placeholder
vercel env rm MONGODB_URI production --yes
vercel env rm MONGODB_URI preview --yes
vercel env rm MONGODB_URI development --yes

# Add your real connection string
vercel env add MONGODB_URI production
# (paste your connection string when prompted)

vercel env add MONGODB_URI preview
# (paste your connection string)

vercel env add MONGODB_URI development
# (paste your connection string)

# Redeploy
vercel --prod
```

**Option C: Using Vercel Dashboard**
1. Go to: https://vercel.com/chickenloop3845-commits-projects/cl1/settings/environment-variables
2. Find `MONGODB_URI` in the list
3. Click the "..." menu → "Edit"
4. Update the value with your connection string
5. Save
6. Go to Deployments → Click "..." on latest → "Redeploy"

## Verify Setup

After updating and redeploying:

1. Visit your app: https://cl1-ly2bd2q12-chickenloop3845-commits-projects.vercel.app
2. Try to register a new account
3. If it works, MongoDB is connected! ✅

## Troubleshooting

**Connection Error?**
- Check that Network Access includes 0.0.0.0/0
- Verify username/password in connection string
- Make sure `/chickenloop` is in the connection string

**Authentication Failed?**
- Double-check username and password
- Make sure special characters in password are URL-encoded

**Can't Connect?**
- Wait a few minutes after creating cluster (takes time to provision)
- Check MongoDB Atlas dashboard for cluster status

## Security Notes

- The free M0 tier is perfect for development and small apps
- Network access 0.0.0.0/0 allows any IP (fine for Vercel deployment)
- For production, consider restricting IPs to Vercel's IP ranges
- Keep your database credentials secure!

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

