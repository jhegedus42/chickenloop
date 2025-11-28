# ⚡ Quick Deploy Guide - 2 Minutes

## Option 1: Deploy via Website (Easiest - 2 minutes)

1. **Go to Vercel**: https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** the repository: `chickenloop3845-commits/chickenloop`
4. **Click "Deploy"** (Vercel auto-detects Next.js)
5. **Add Environment Variables** (after first deploy):
   - Go to **Settings** → **Environment Variables**
   - Add `MONGODB_URI` (your MongoDB connection string)
   - Add `JWT_SECRET` = `2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=`
   - **Redeploy** from Deployments tab

**That's it!** Your app will be live at `https://chickenloop.vercel.app` (or similar)

## Option 2: Deploy via CLI (If you prefer)

```bash
# 1. Login (opens browser)
vercel login

# 2. Deploy
vercel --prod

# 3. Add environment variables in Vercel dashboard
# 4. Redeploy
```

## MongoDB Setup (If needed)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/chickenloop`
6. Add to Vercel as `MONGODB_URI`

## Your Repository

🔗 **GitHub**: https://github.com/chickenloop3845-commits/chickenloop

---

**Recommended**: Use Option 1 (Website) - it's the fastest and easiest!

