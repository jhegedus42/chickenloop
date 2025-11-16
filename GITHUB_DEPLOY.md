# Deploy ChickenLoop to Vercel via GitHub

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it (e.g., `chickenloop` or `watersports-jobs`)
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push Your Code to GitHub

After creating the repo, GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push your code
git branch -M main
git push -u origin main
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository (select the `chickenloop` repo)
4. Vercel will auto-detect Next.js settings - click "Deploy"

## Step 4: Configure Environment Variables

**IMPORTANT:** Before your first deployment completes, or right after:

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add these two variables:

   **Variable 1:**
   - Name: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string
     (Format: `mongodb+srv://username:password@cluster.mongodb.net/chickenloop`)
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `JWT_SECRET`
   - Value: `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`
   - Environment: Production, Preview, Development (select all)

3. Click "Save"
4. Go to **Deployments** tab and click the "..." menu on the latest deployment → **Redeploy**

## Step 5: Set Up MongoDB Atlas (If Not Done Yet)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a cluster (free M0 tier)
4. **Database Access:**
   - Create a database user (save username/password!)
5. **Network Access:**
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. **Get Connection String:**
   - Click "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add `/chickenloop` at the end

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/chickenloop
```

## Step 6: Test Your Deployment

1. Visit your Vercel deployment URL (e.g., `https://chickenloop.vercel.app`)
2. Register a new account
3. Test creating jobs or CVs
4. Everything should work! 🎉

## Troubleshooting

- **Connection errors?** Make sure MongoDB Atlas IP whitelist includes 0.0.0.0/0
- **Authentication errors?** Verify JWT_SECRET is set correctly
- **Database errors?** Check that MONGODB_URI includes the database name `/chickenloop`

## Your Generated JWT Secret

Save this securely:
```
2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=
```

