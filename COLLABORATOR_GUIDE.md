# 👥 Collaborator Guide - ChickenLoop

This guide helps new collaborators set up the project, access Git, troubleshoot Vercel deployments, and work effectively with the codebase.

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chickenloop3845-commits/chickenloop.git
   cd chickenloop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

## 🔐 Git Access Setup

### Option 1: HTTPS (Easiest - Recommended for beginners)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chickenloop3845-commits/chickenloop.git
   ```

2. **When pushing, use GitHub CLI or Personal Access Token:**
   - Install GitHub CLI: `brew install gh` (Mac) or see [GitHub CLI docs](https://cli.github.com/)
   - Authenticate: `gh auth login`
   - Now you can push: `git push origin main`

### Option 2: SSH (More secure, no password prompts)

See detailed instructions in [`GITHUB_SSH_SETUP.md`](./GITHUB_SSH_SETUP.md)

**Quick SSH setup:**
```bash
# 1. Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. Copy public key
cat ~/.ssh/id_ed25519.pub

# 3. Add to GitHub: Settings → SSH and GPG keys → New SSH key

# 4. Test connection
ssh -T git@github.com

# 5. Change remote to SSH
git remote set-url origin git@github.com:chickenloop3845-commits/chickenloop.git
```

## 📦 Vercel Deployment

### Check Deployment Status

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Check deployments
vercel ls

# View latest deployment logs
vercel inspect <deployment-url> --logs
```

**Via Vercel Dashboard:**
- Go to: https://vercel.com/dashboard
- Select project: `cl1` or `chickenloop`
- View deployment history and logs

### Common Deployment Issues

#### 1. Build Failures

**TypeScript Errors:**
```bash
# Test build locally first
npm run build

# Fix any TypeScript errors before pushing
```

**Missing Dependencies:**
```bash
# If build fails with "Module not found"
npm install <missing-package>
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

#### 2. Environment Variables

**Check if variables are set in Vercel:**
```bash
vercel env ls
```

**Required environment variables:**
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens

**Update environment variables:**
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
```

Or via Vercel Dashboard: Project Settings → Environment Variables

#### 3. MongoDB Connection Issues

**IP Whitelisting:**
- Go to MongoDB Atlas → Network Access
- Add `0.0.0.0/0` to allow all IPs (for Vercel)
- Or add specific Vercel IP ranges

**Connection String:**
- Format: `mongodb+srv://username:password@cluster.mongodb.net/chickenloop`
- Make sure password is URL-encoded if it contains special characters

See [`MONGODB_SETUP.md`](./MONGODB_SETUP.md) for detailed instructions.

#### 4. Deployment Hangs or Times Out

**Check build logs:**
```bash
vercel inspect <deployment-url> --logs
```

**Common causes:**
- Large files in repository (check `.gitignore`)
- Slow npm install (check `package.json` for unnecessary dependencies)
- TypeScript compilation errors

### Auto-Deployment

Vercel automatically deploys when you push to `main` branch:
```bash
git push origin main
# Vercel will detect the push and start deployment
# Check status: vercel ls
```

## 🐛 Troubleshooting

### Local Development Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**MongoDB connection fails:**
- Check `.env.local` has correct `MONGODB_URI`
- Verify MongoDB Atlas IP whitelist includes your IP
- Test connection: `mongosh "<your-connection-string>"`

**TypeScript errors:**
```bash
# Run type check
npx tsc --noEmit

# Fix errors before committing
```

### Git Issues

**Merge conflicts:**
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in files
# Then commit
git add .
git commit -m "Resolve merge conflicts"
git push
```

**Undo last commit (before pushing):**
```bash
git reset --soft HEAD~1
```

**Undo last commit (after pushing - use carefully!):**
```bash
git revert HEAD
git push
```

### Build Issues

**Clear Next.js cache:**
```bash
rm -rf .next
npm run build
```

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Working with the Codebase

### Project Structure

```
chickenloop/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── recruiter/         # Recruiter pages
│   ├── job-seeker/        # Job seeker pages
│   └── components/        # React components
├── lib/                   # Utility functions
├── models/                # Mongoose models
└── public/                # Static files
```

### Code Style

- **TypeScript**: All files use TypeScript
- **Formatting**: Use Prettier (if configured)
- **Linting**: ESLint is configured
- **Naming**: camelCase for variables, PascalCase for components

### Making Changes

1. **Create a feature branch (optional):**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Test locally:**
   ```bash
   npm run dev
   # Test your changes
   npm run build  # Ensure build passes
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main  # or your branch name
   ```

## 🔍 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build

# Git
git status           # Check current status
git log --oneline    # View commit history
git pull             # Get latest changes
git push             # Push your changes

# Vercel
vercel ls            # List deployments
vercel logs          # View logs
vercel inspect       # Inspect deployment

# MongoDB (if using local)
mongosh              # Connect to local MongoDB
```

## 📚 Additional Resources

- **Setup Guide**: [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) - Detailed local setup
- **GitHub SSH**: [`GITHUB_SSH_SETUP.md`](./GITHUB_SSH_SETUP.md) - SSH setup
- **Deployment**: [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Full deployment guide
- **MongoDB**: [`MONGODB_SETUP.md`](./MONGODB_SETUP.md) - MongoDB Atlas setup
- **Project Overview**: [`README.md`](./README.md) - Project documentation

## 🆘 Getting Help

1. **Check existing documentation** in the repository
2. **Review recent commits**: `git log --oneline -10`
3. **Check Vercel deployment logs** for errors
4. **Test locally first** before pushing changes
5. **Ask the team** if you're stuck

## ✅ Pre-Push Checklist

Before pushing to main:

- [ ] Code builds successfully: `npm run build`
- [ ] No TypeScript errors
- [ ] No linting errors: `npm run lint` (if configured)
- [ ] Tested locally: `npm run dev`
- [ ] Environment variables are set (for Vercel)
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] Commit message is descriptive

## 🔒 Security Notes

- **Never commit** `.env.local` or any files with secrets
- **Never commit** API keys, passwords, or tokens
- **Always use** environment variables for sensitive data
- **Review** `.gitignore` before committing

---

**Happy coding! 🚀**

