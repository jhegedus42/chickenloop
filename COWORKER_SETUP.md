# 👥 Coworker Setup Guide

Welcome! This guide will help you set up your local development environment to work with the shared database.

## ✅ Quick Setup (5 minutes)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd chickenloop
npm install
```

### Step 2: Get Database Credentials

**Contact your team lead** to get:
1. `MONGODB_URI` - MongoDB Atlas connection string
2. `JWT_SECRET` - Authentication secret (shared across team)

**⚠️ Security:** These should be shared via:
- Secure password manager (1Password, LastPass, etc.)
- Encrypted messaging (Signal, WhatsApp)
- Private Slack/Discord channel
- **NEVER via public channels or Git commits**

### Step 3: Create `.env.local` File

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in the values you received:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chickenloop?appName=ClusterName
   JWT_SECRET=your_jwt_secret_here
   ```

3. Save the file

### Step 4: Start Development Server

```bash
npm run dev
```

Your app should now be running at `http://localhost:3000` and connected to the shared database!

## 🔒 Important Notes

### Database Sharing
- ✅ **Everyone connects to the same MongoDB Atlas database**
- ✅ **All changes are shared** - be careful with test data
- ✅ **Use test/development accounts** when possible
- ⚠️ **Be respectful** - don't delete or modify production data

### Environment Variables
- ✅ `.env.local` is already in `.gitignore` - it won't be committed
- ✅ Each developer has their own `.env.local` file
- ✅ All `.env.local` files point to the same database

### Best Practices
1. **Use test accounts** for development work
2. **Communicate** when making schema changes
3. **Test locally** before pushing code changes
4. **Don't commit** `.env.local` (it's already ignored)

## 🛠️ Troubleshooting

### "Please define the MONGODB_URI environment variable"
- Make sure `.env.local` exists in the project root
- Check that `MONGODB_URI` is spelled correctly
- Restart your dev server after creating/editing `.env.local`

### Can't connect to database?
- Verify the connection string is correct
- Check that your IP is allowed in MongoDB Atlas Network Access (should be 0.0.0.0/0)
- Contact your team lead to verify credentials

### Changes not appearing?
- Make sure you're using the same `MONGODB_URI` as the team
- Check that the database name matches (should be `chickenloop`)
- Refresh your browser / restart dev server

## 📋 Checklist

- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created
- [ ] `MONGODB_URI` added (from team lead)
- [ ] `JWT_SECRET` added (from team lead)
- [ ] Dev server runs successfully (`npm run dev`)
- [ ] Can log in / see shared data

## 🆘 Need Help?

Contact your team lead or check:
- `README.md` - General project setup
- `SETUP_GUIDE.md` - Detailed setup instructions
- MongoDB Atlas Dashboard - Verify connection settings

