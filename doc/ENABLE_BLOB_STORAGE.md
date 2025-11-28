# Enable Vercel Blob Storage - Step by Step Guide

## Why This is Needed

Your images are now configured to use Vercel Blob Storage (cloud storage) instead of the local filesystem. This ensures images persist across deployments and work correctly on Vercel's serverless platform.

## Steps to Enable Blob Storage

### Step 1: Go to Your Vercel Project Dashboard

1. Visit [https://vercel.com](https://vercel.com) and sign in
2. Navigate to your **ChickenLoop** project
3. Click on your project to open the dashboard

### Step 2: Navigate to Storage

1. In your project dashboard, click on the **Storage** tab (in the left sidebar)
2. If you don't see a Storage tab, click on **Settings** first, then look for **Storage** in the settings menu

### Step 3: Create a Blob Store

1. Click the **Create Database** button (or **Add Storage** button)
2. Select **Blob** from the list of storage options
3. Give your Blob store a name (e.g., `chickenloop-images` or `chickenloop-blob`)
4. Click **Create** (or **Continue**)

### Step 4: Connect Blob Store to Your Project

1. After creating the Blob store, you'll see it in your Storage list
2. Click on the Blob store you just created
3. Look for a **Connect** or **Link to Project** option
4. Select your ChickenLoop project from the list
5. Click **Connect** or **Save**

### Step 5: Verify Environment Variable

Vercel automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable to your project when you connect the Blob store. To verify:

1. Go to **Settings** → **Environment Variables**
2. You should see `BLOB_READ_WRITE_TOKEN` listed
3. It should be available for Production, Preview, and Development environments

### Step 6: Redeploy Your Application

1. Go to the **Deployments** tab
2. Find your latest deployment
3. Click the **"..."** (three dots) menu on the deployment
4. Select **Redeploy**
5. Wait for the deployment to complete

## Testing Image Uploads

After redeployment:

1. Visit your Vercel site (e.g., `https://your-project.vercel.app`)
2. Log in as a recruiter
3. Try uploading a company picture or job picture
4. The image should upload successfully and display correctly
5. Check that the image URL starts with `https://` and contains `blob.vercel-storage.com`

## Troubleshooting

### Images Still Not Showing?

1. **Check Environment Variables:**
   - Go to Settings → Environment Variables
   - Ensure `BLOB_READ_WRITE_TOKEN` exists
   - If missing, disconnect and reconnect the Blob store

2. **Check Deployment Logs:**
   - Go to Deployments → Click on latest deployment → View Function Logs
   - Look for any errors related to blob storage

3. **Verify Blob Store is Connected:**
   - Go to Storage tab
   - Ensure your Blob store shows as "Connected" to your project

### For Local Development

If you want to test image uploads locally:

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Pull environment variables:
   ```bash
   cd chickenloop
   vercel env pull
   ```

4. This will create/update your `.env.local` file with the `BLOB_READ_WRITE_TOKEN`

5. Restart your dev server:
   ```bash
   npm run dev
   ```

## What Changed?

- ✅ Images are now stored in Vercel Blob Storage (cloud)
- ✅ Images persist across deployments
- ✅ Images work correctly on Vercel's serverless platform
- ✅ No more local filesystem storage issues

## Important Notes

- **Existing Images:** Old images with `/uploads/...` paths in your MongoDB database won't work until re-uploaded
- **New Images:** All new uploads will use cloud URLs from Vercel Blob Storage
- **Cost:** Vercel Blob Storage has a free tier (check current pricing on Vercel's website)

## Need Help?

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify the Blob store is connected to your project
3. Ensure `BLOB_READ_WRITE_TOKEN` is in your environment variables
4. Try redeploying after making changes

---

**Status:** Once you complete these steps, your images will work correctly on Vercel! 🎉

