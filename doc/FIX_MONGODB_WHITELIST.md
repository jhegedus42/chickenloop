# Fix MongoDB Atlas IP Whitelist Issue

## Quick Fix (2 minutes)

### Step 1: Go to MongoDB Atlas Network Access

1. Go to: https://cloud.mongodb.com
2. Sign in to your account
3. Click on **"Network Access"** in the left sidebar

### Step 2: Add IP Address

1. Click **"Add IP Address"** button
2. Click **"Allow Access from Anywhere"** button
   - This adds `0.0.0.0/0` which allows all IPs (including Vercel)
3. Click **"Confirm"**

**That's it!** This will allow Vercel (and any other service) to connect to your database.

## Why This Happens

Vercel uses dynamic IP addresses that change frequently. By allowing `0.0.0.0/0`, you're allowing connections from anywhere, which is necessary for serverless deployments like Vercel.

## Security Note

For production applications, you can restrict to Vercel's IP ranges, but for now, allowing all IPs is the simplest solution and is fine for development/testing.

## Verify It Works

After adding the IP whitelist:
1. Wait 1-2 minutes for changes to propagate
2. Try registering again on your app
3. It should work now!

