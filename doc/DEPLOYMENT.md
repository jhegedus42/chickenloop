# Deployment Guide for ChickenLoop

This guide will help you deploy ChickenLoop to Vercel with MongoDB Atlas.

## Step 1: Set up MongoDB Atlas (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for Vercel deployment
6. Get your connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/chickenloop`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended)

1. Push your code to GitHub:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [Vercel](https://vercel.com) and sign in with GitHub

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random secret string (e.g., generate with `openssl rand -base64 32`)

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Verify Deployment

1. Visit your Vercel deployment URL
2. Register a new account
3. Test the functionality

## Alternative Deployment Options

### Railway
1. Go to [Railway](https://railway.app)
2. Create a new project from GitHub
3. Add MongoDB service (or use MongoDB Atlas)
4. Set environment variables
5. Deploy

### Render
1. Go to [Render](https://render.com)
2. Create a new Web Service from GitHub
3. Set environment variables
4. Deploy

## Environment Variables Required

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing

## Notes

- Make sure your MongoDB Atlas cluster allows connections from Vercel's IP addresses
- The free tier of MongoDB Atlas is sufficient for development and small applications
- Vercel's free tier includes generous limits for Next.js applications

