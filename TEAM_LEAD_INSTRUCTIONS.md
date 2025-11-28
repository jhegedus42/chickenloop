# 👨‍💼 Team Lead Instructions: Setting Up Shared Database Access

This guide explains how to set up your team to work with a shared MongoDB Atlas database.

## 🎯 Overview

All team members will connect to the **same MongoDB Atlas database**. Each developer:
- Has their own local `.env.local` file (not committed to Git)
- Uses the **same** `MONGODB_URI` and `JWT_SECRET` values
- Shares the same database content (users, jobs, companies, CVs)

## ✅ What's Already Set Up

1. ✅ MongoDB Atlas database is cloud-hosted and accessible
2. ✅ Network access allows connections from anywhere (0.0.0.0/0)
3. ✅ `.env.local` is already in `.gitignore` (won't be committed)
4. ✅ Coworker setup guide created (`COWORKER_SETUP.md`)

## 📋 Steps to Share Access

### Step 1: Prepare Credentials File

I've created `SHARED_DATABASE_CREDENTIALS.template.md` with your actual credentials. This file:
- ✅ Is already added to `.gitignore` (won't be committed)
- ✅ Contains your `MONGODB_URI` and `JWT_SECRET`
- ✅ Can be shared directly with team members

**Option A: Share the File Directly**
- Send `SHARED_DATABASE_CREDENTIALS.template.md` via secure channel (password manager, encrypted message)

**Option B: Share Credentials Manually**
- Share these two values securely:
  ```
  MONGODB_URI=mongodb+srv://chickenloop3845_db_user:msLBG6d6lscrfQYf@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369
  JWT_SECRET=2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=
  ```

### Step 2: Direct Coworker to Setup Guide

Tell your coworker to:
1. Read `COWORKER_SETUP.md` for detailed instructions
2. Get credentials from you (via secure channel)
3. Create their own `.env.local` file with the shared credentials

### Step 3: Verify Setup

After your coworker sets up:
- Ask them to run `npm run dev` and verify they can see the same data
- They should be able to see users, jobs, and companies that exist in the shared database

## 🔒 Security Best Practices

1. **Never commit credentials to Git**
   - ✅ `.env.local` is in `.gitignore`
   - ✅ `SHARED_DATABASE_CREDENTIALS.template.md` is in `.gitignore`
   - ⚠️ Always verify before committing

2. **Share credentials securely**
   - Use password managers (1Password, LastPass)
   - Encrypted messaging (Signal, WhatsApp)
   - Private team channels
   - **Never via public GitHub issues or commits**

3. **MongoDB Atlas Security**
   - Current setup allows access from anywhere (0.0.0.0/0)
   - For production, consider restricting to specific IPs
   - Monitor database access in MongoDB Atlas dashboard

## 📝 Quick Checklist

- [ ] Verify `SHARED_DATABASE_CREDENTIALS.template.md` has correct credentials
- [ ] Share credentials securely with coworker
- [ ] Direct coworker to `COWORKER_SETUP.md`
- [ ] Verify coworker can connect and see shared data
- [ ] Remind team about database sharing best practices

## 🆘 Troubleshooting

**Coworker can't connect?**
- Verify MongoDB Atlas Network Access includes 0.0.0.0/0
- Check credentials are correct
- Ensure database name is `chickenloop` in connection string

**Different data visible?**
- Verify both are using the same `MONGODB_URI`
- Check database name matches (should be `chickenloop`)
- Restart dev servers

**Need to rotate credentials?**
1. Create new database user in MongoDB Atlas
2. Update `MONGODB_URI` with new credentials
3. Share new credentials securely with all team members
4. Update Vercel environment variables if deployed

## 📚 Files Created

- `COWORKER_SETUP.md` - Setup instructions for new team members
- `SHARED_DATABASE_CREDENTIALS.template.md` - Credentials file (in .gitignore)
- `.env.example` - Template for environment variables (safe to commit)

