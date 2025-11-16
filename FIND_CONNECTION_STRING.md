# How to Find Your MongoDB Atlas Connection String

## Step-by-Step Instructions

### Step 1: Log into MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Sign in with your account

### Step 2: Navigate to Your Cluster
1. You should see your cluster on the main dashboard
2. Click on your cluster name (or the "Connect" button)

### Step 3: Get the Connection String
1. Click the **"Connect"** button on your cluster card
2. A modal will pop up with connection options
3. Choose **"Connect your application"** (the third option)
4. You'll see a connection string that looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Copy this entire string**

### Step 4: What I Need From You
Just copy and paste that connection string here, and I'll:
- Replace `<username>` with `chickenloop3845_db_user`
- Replace `<password>` with `msLBG6d6lscrfQYf`
- Add `/chickenloop` before the `?` to specify the database name
- Update it in Vercel automatically

## Visual Guide

```
MongoDB Atlas Dashboard
├── Your Cluster (click "Connect")
    ├── Connect your application
        └── Connection string (copy this!)
```

## Alternative: Find Cluster Hostname

If you can't find the connection string, look for:
- **Cluster name** in the dashboard (e.g., "Cluster0")
- **Connection string** in cluster details
- The hostname usually looks like: `cluster0.xxxxx.mongodb.net` or `cluster0.xxxxx.mongodb.net`

Once you have either:
1. The full connection string, OR
2. The cluster hostname (the part after @ and before /)

I can construct the complete connection string and update Vercel for you!

