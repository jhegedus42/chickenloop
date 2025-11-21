# 🔐 Passwords and Secrets Reference

**⚠️ SECURITY WARNING: This file should NOT contain actual passwords. It only documents WHERE to find them and HOW to set them up.**

## Required Credentials

### 1. MongoDB Atlas Database

**Where to find:**
- MongoDB Atlas Dashboard: https://cloud.mongodb.com/
- Login: Use the account that created the cluster
- Location: Database Access → Database Users

**Credentials needed:**
- **Database Username**: `chickenloop3845_db_user`
- **Database Password**: [Stored in MongoDB Atlas - see below]
- **Connection String**: Format: `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/chickenloop`

**How to retrieve password:**
1. Go to MongoDB Atlas → Database Access
2. Find user: `chickenloop3845_db_user`
3. Click "Edit" → "Edit Password"
4. If forgotten, reset the password (you'll need Atlas account access)

**How to get connection string:**
1. MongoDB Atlas → Database → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with actual password
5. Add database name: `...mongodb.net/chickenloop`

**For local development:**
- Store in `.env.local`: `MONGODB_URI=mongodb+srv://...`

**For Vercel deployment:**
- Store in Vercel Environment Variables: `MONGODB_URI`
- Access: Vercel Dashboard → Project → Settings → Environment Variables

---

### 2. JWT Secret

**What it is:**
- Secret key used to sign and verify JWT authentication tokens
- Should be a long, random string

**Where it's stored:**
- **Local**: `.env.local` file (not in Git)
- **Vercel**: Environment Variables → `JWT_SECRET`

**How to generate:**
```bash
# Generate a secure random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**How to set up:**
1. Generate a secret (see above)
2. **Local**: Add to `.env.local`:
   ```env
   JWT_SECRET=your-generated-secret-here
   ```
3. **Vercel**: Add via CLI or Dashboard:
   ```bash
   vercel env add JWT_SECRET production
   # Enter the secret when prompted
   ```

**⚠️ Important:**
- Use different secrets for development and production
- Never commit `.env.local` to Git
- Keep secrets secure and rotate them periodically

---

### 3. GitHub Access

**For HTTPS (Personal Access Token):**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing via HTTPS

**For SSH:**
- Uses SSH keys (no password needed after setup)
- See [GITHUB_SSH_SETUP.md](./GITHUB_SSH_SETUP.md) for details

---

### 4. Vercel Account

**Access:**
- Dashboard: https://vercel.com/dashboard
- Login: Use GitHub account (OAuth)
- No separate password needed if using GitHub login

**Project Access:**
- Project: `cl1` or `chickenloop`
- Team: `chickenloop3845-commits-projects`

---

## Environment Variables Summary

### Local Development (`.env.local`)

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://chickenloop3845_db_user:PASSWORD@cluster042369.iggtazi.mongodb.net/chickenloop?appName=Cluster042369

# JWT Secret
JWT_SECRET=your-jwt-secret-here
```

**⚠️ Replace:**
- `PASSWORD` with actual MongoDB password
- `your-jwt-secret-here` with generated JWT secret

### Vercel Production

**Required Environment Variables:**
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - JWT signing secret

**How to set:**
```bash
# Via CLI
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production

# Or via Dashboard:
# Project → Settings → Environment Variables → Add
```

---

## Where Passwords Are Actually Stored

### ✅ Secure Locations (Not in Git)

1. **MongoDB Atlas**
   - Database user passwords
   - Connection strings
   - Access: https://cloud.mongodb.com/

2. **Vercel Environment Variables**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - Access: Vercel Dashboard → Project Settings

3. **Local `.env.local` file**
   - Development credentials
   - **Never committed to Git** (in `.gitignore`)

4. **GitHub Secrets** (if using Actions)
   - CI/CD credentials
   - Access: Repository → Settings → Secrets

### ❌ Never Store Here

- ❌ Git repository (even if private)
- ❌ Documentation files (this file is an exception - no actual passwords)
- ❌ Code comments
- ❌ Public files
- ❌ Shared documents

---

## Password Recovery

### MongoDB Atlas Password

**If you forgot the database password:**
1. Go to MongoDB Atlas → Database Access
2. Find user: `chickenloop3845_db_user`
3. Click "Edit" → "Edit Password"
4. Set new password
5. Update `.env.local` and Vercel environment variables

**If you lost Atlas account access:**
- Contact the account owner
- Or create a new database user

### JWT Secret

**If lost:**
1. Generate a new one (see above)
2. Update `.env.local` for local development
3. Update Vercel environment variable
4. **Note**: All existing user sessions will be invalidated (users need to log in again)

---

## Setting Up for New Collaborators

### Step 1: Get MongoDB Credentials

1. Ask project owner for MongoDB Atlas access OR
2. Create your own MongoDB Atlas account and cluster
3. Get connection string
4. Add to `.env.local`:
   ```env
   MONGODB_URI=your-connection-string
   ```

### Step 2: Generate JWT Secret

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```env
JWT_SECRET=generated-secret-here
```

### Step 3: Create `.env.local`

Create `.env.local` in project root:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chickenloop
JWT_SECRET=your-generated-secret
```

**⚠️ Important:**
- `.env.local` is in `.gitignore` - it won't be committed
- Never commit this file
- Each developer should have their own `.env.local`

---

## Security Best Practices

1. **Never commit secrets:**
   - ✅ `.env.local` is in `.gitignore`
   - ✅ Never add passwords to code
   - ✅ Never commit `.env` files

2. **Use environment variables:**
   - ✅ Local: `.env.local`
   - ✅ Production: Vercel Environment Variables
   - ❌ Never hardcode in source code

3. **Rotate secrets periodically:**
   - Change JWT secret every 6-12 months
   - Change database passwords if compromised

4. **Use strong passwords:**
   - MongoDB: At least 16 characters, mixed case, numbers, symbols
   - JWT Secret: Use `openssl rand -base64 32` (32+ bytes)

5. **Limit access:**
   - Only share credentials with trusted team members
   - Use MongoDB Atlas IP whitelisting
   - Use Vercel team access controls

---

## Quick Reference

| Credential | Location | How to Access |
|------------|----------|---------------|
| MongoDB Password | MongoDB Atlas | Database Access → Edit User |
| MongoDB Connection | MongoDB Atlas | Database → Connect → Application |
| JWT Secret (Local) | `.env.local` | Create file with generated secret |
| JWT Secret (Vercel) | Vercel Dashboard | Settings → Environment Variables |
| GitHub Token | GitHub Settings | Developer settings → Personal access tokens |

---

## Need Help?

1. **Can't access MongoDB:**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string format
   - Test connection: `mongosh "connection-string"`

2. **Can't access Vercel:**
   - Verify GitHub account has access
   - Check team membership
   - Contact project owner

3. **Environment variables not working:**
   - Verify `.env.local` exists and is in root directory
   - Check variable names match exactly
   - Restart dev server after changes
   - For Vercel: Redeploy after adding variables

---

**Remember: This file documents WHERE to find passwords, not the passwords themselves. Keep actual passwords secure! 🔒**

