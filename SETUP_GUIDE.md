# 🚀 Setup Guide - ChickenLoop Development Environment

This guide will help you set up the ChickenLoop project on your local machine using Cursor IDE.

## Prerequisites

Before you begin, make sure you have the following installed:

### Required Software

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```
   - Should show v18.x.x or higher

2. **Git**
   - Download from: https://git-scm.com/downloads
   - Verify installation:
     ```bash
     git --version
     ```

3. **Cursor IDE**
   - Download from: https://cursor.sh/
   - Install the latest version
   - Cursor is a VS Code fork with AI features

4. **MongoDB** (choose one option):
   - **Option A**: MongoDB Atlas (Cloud - Recommended for beginners)
     - Free tier available
     - No local installation needed
   - **Option B**: MongoDB Community Edition (Local)
     - Download from: https://www.mongodb.com/try/download/community
     - Requires local installation and running service

## Step-by-Step Setup

### Step 1: Clone the Repository

1. Open Cursor IDE
2. Open the terminal in Cursor (`` Ctrl+` `` or `View → Terminal`)
3. Navigate to where you want to clone the project:
   ```bash
   cd ~/Documents  # or wherever you keep your projects
   ```
4. Clone the repository:
   ```bash
   git clone https://github.com/chickenloop3845-commits/chickenloop.git
   cd chickenloop
   ```

### Step 2: Install Dependencies

1. In the terminal (still in the `chickenloop` directory), run:
   ```bash
   npm install
   ```
2. Wait for all packages to install (this may take 2-5 minutes)
3. You should see a `node_modules` folder created

### Step 3: Set Up MongoDB

#### Option A: MongoDB Atlas (Recommended - Cloud Database)

1. **Create a MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account

2. **Create a Cluster**
   - After logging in, click "Build a Database"
   - Choose the **FREE** (M0) tier
   - Select a cloud provider and region (choose closest to you)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create a username (e.g., `chickenloop_user`)
   - Create a strong password (save this!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Or add your specific IP address for better security
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Click "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/chickenloop`
   - **Save this string** - you'll need it in the next step

#### Option B: MongoDB Local Installation

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for your OS
   - Start MongoDB service:
     ```bash
     # macOS (using Homebrew)
     brew services start mongodb-community
     
     # Linux
     sudo systemctl start mongod
     
     # Windows
     # MongoDB should start automatically as a service
     ```

2. **Verify MongoDB is Running**
   ```bash
   mongosh  # or mongo for older versions
   ```
   - If it connects, you're good! Type `exit` to leave

3. **Connection String**
   - For local MongoDB, use: `mongodb://localhost:27017/chickenloop`

### Step 4: Create Environment Variables File

1. In Cursor, in the project root directory (`chickenloop`), create a new file named `.env.local`
   - Right-click in the file explorer → "New File"
   - Name it exactly: `.env.local` (including the dot at the beginning)

2. Add the following content to `.env.local`:
   ```env
   # MongoDB Connection String
   # For MongoDB Atlas (cloud):
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chickenloop
   
   # For Local MongoDB:
   # MONGODB_URI=mongodb://localhost:27017/chickenloop
   
   # JWT Secret Key (for authentication)
   # Generate a new one with: openssl rand -base64 32
   JWT_SECRET=2hxoXFr26ersairETgh8k0lBTC0fT2xR0YetVIuJxM8=
   ```

3. **Replace the values:**
   - Replace `MONGODB_URI` with your actual MongoDB connection string from Step 3
   - The `JWT_SECRET` can stay the same for development, or generate a new one:
     ```bash
     openssl rand -base64 32
     ```

4. **Important:** The `.env.local` file is in `.gitignore` and won't be committed to git. Each developer needs their own.

### Step 5: Verify Setup

1. **Check your `.env.local` file exists:**
   ```bash
   ls -la | grep .env.local
   ```
   - Should show the file

2. **Verify Node.js and npm:**
   ```bash
   node --version  # Should be v18+
   npm --version   # Should be 9+
   ```

### Step 6: Start the Development Server

1. In the terminal (in the `chickenloop` directory), run:
   ```bash
   npm run dev
   ```

2. You should see output like:
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in 2.3s
   ```

3. Open your browser and go to: **http://localhost:3000**

4. You should see the ChickenLoop homepage!

### Step 7: Test the Application

1. **Register a new account:**
   - Click "Register"
   - Fill in: Name, Email, Password
   - Choose a role: "Job Seeker" or "Recruiter"
   - Click "Register"

2. **Login:**
   - Use the credentials you just created
   - You should be redirected to your dashboard

3. **Test features based on your role:**
   - **Job Seeker**: Create a CV, browse jobs
   - **Recruiter**: Post a job, manage your jobs
   - **Admin**: (You'll need to manually set a user as admin in the database)

## Cursor IDE Tips

### Using Cursor's AI Features

1. **Chat with AI:**
   - Press `Cmd+L` (Mac) or `Ctrl+L` (Windows/Linux)
   - Ask questions about the codebase
   - Get help with debugging

2. **Inline AI Suggestions:**
   - Cursor will suggest code as you type
   - Press `Tab` to accept suggestions

3. **Codebase Understanding:**
   - Cursor can understand the entire codebase
   - Ask it to explain any file or function

### Recommended Cursor Extensions

1. **ESLint** - Code linting (may already be included)
2. **Prettier** - Code formatting
3. **GitLens** - Enhanced Git capabilities

### Keyboard Shortcuts

- `Cmd/Ctrl + P` - Quick file search
- `Cmd/Ctrl + Shift + P` - Command palette
- `Cmd/Ctrl + \` - Split editor
- `Cmd/Ctrl + ` ` - Toggle terminal

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: MongoDB connection error

**Check:**
1. Is your MongoDB connection string correct in `.env.local`?
2. For Atlas: Is your IP whitelisted?
3. For Local: Is MongoDB service running?
   ```bash
   # Check if MongoDB is running
   mongosh  # Should connect
   ```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill the process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use a different port:
PORT=3001 npm run dev
```

### Issue: Environment variables not loading

**Check:**
1. File is named exactly `.env.local` (with the dot)
2. File is in the root directory (same level as `package.json`)
3. Restart the dev server after changing `.env.local`

### Issue: TypeScript errors

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Or check for type errors:
npx tsc --noEmit
```

### Issue: "Module not found" for @ imports

**Solution:**
- Check `tsconfig.json` has correct path aliases
- Restart Cursor IDE
- Run `npm install` again

## Project Structure Overview

```
chickenloop/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── components/        # React components
│   ├── contexts/          # React contexts (AuthContext)
│   └── [role]/            # Role-specific pages
├── lib/                   # Utility functions
│   ├── api.ts            # Frontend API client
│   ├── auth.ts           # Auth middleware
│   ├── db.ts             # MongoDB connection
│   └── jwt.ts            # JWT utilities
├── models/               # Mongoose schemas
├── .env.local            # Environment variables (create this!)
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## Development Workflow

1. **Make changes** to code in Cursor
2. **Save files** (auto-saves in Cursor)
3. **See changes** in browser (Next.js hot-reloads automatically)
4. **Test** your changes
5. **Commit** when ready:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

## Getting Help

1. **Check the codebase:**
   - Read `CHAT_SUMMARY.md` for project overview
   - Read `README.md` for API documentation

2. **Ask Cursor AI:**
   - Use `Cmd+L` to chat with AI about the codebase
   - Ask specific questions about files or functions

3. **Check GitHub:**
   - Issues and discussions on the repository
   - Commit history to see what changed

## Next Steps

Once you have the app running:

1. ✅ Explore the codebase structure
2. ✅ Try creating different user roles
3. ✅ Test all features (jobs, CVs, admin)
4. ✅ Make your first change
5. ✅ Push your changes to GitHub

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Run linter
npm run lint

# Install new package
npm install package-name

# Check git status
git status

# Pull latest changes
git pull origin main
```

---

**Happy coding! 🎉**

If you run into any issues, check the troubleshooting section above or ask Cursor AI for help!

