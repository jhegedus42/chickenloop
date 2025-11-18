# Conversation Export - ChickenLoop Development

This document contains a comprehensive export of the development conversation for the ChickenLoop project.

## Project Overview

**ChickenLoop** - A watersports job platform with three user types:
- **Recruiter**: Can post, view, edit, and delete their own jobs. Cannot create a CV.
- **Job-seeker**: Can create, edit, and delete their own CV. Can see all jobs but not CVs.
- **Admin**: Can delete users, see all their data, and edit all their data.

## Tech Stack

- **Backend**: Next.js API Routes (App Router)
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: Next.js (Client-side)
- **Deployment**: Vercel
- **Database Hosting**: MongoDB Atlas

## Key Development Decisions

### 1. Authentication & Access Control
- Jobs API requires authentication (user rejected making it public)
- Jobs page requires login (user reverted public access)
- Home page shows jobs only to logged-in job-seekers
- Jobs link in navbar only visible to job-seekers

### 2. Next.js 16 Compatibility
- Updated dynamic route handlers to handle `params` as a `Promise`
- Fixed TypeScript errors with explicit type casting for `user._id`

### 3. Caching Strategy
- Added middleware.ts for cache control headers
- Added meta tags in layout.tsx to prevent stale content
- Configured cache headers for API routes and pages

### 4. Deployment Setup
- Repository: https://github.com/chickenloop3845-commits/chickenloop
- Vercel project: `cl1` (auto-deploys on push to main)
- MongoDB Atlas configured with IP whitelisting (0.0.0.0/0)
- Environment variables: `MONGODB_URI`, `JWT_SECRET`

## Recent Changes

### Latest Commit: `f6e0eb8`
- Added company model and pages
- Updated logo files (logo.png, logo.svg)
- Enhanced recruiter dashboard with company features
- Updated job creation/editing to include company selection

### Files Modified
- `app/api/company/route.ts` (new)
- `app/api/jobs/[id]/route.ts`
- `app/api/jobs/route.ts`
- `app/components/Navbar.tsx`
- `app/page.tsx`
- `app/recruiter/company/new/page.tsx` (new)
- `app/recruiter/jobs/[id]/edit/page.tsx`
- `app/recruiter/jobs/new/page.tsx`
- `app/recruiter/page.tsx`
- `app/register/page.tsx`
- `lib/api.ts`
- `models/Company.ts` (new)
- `models/Job.ts`

## GitHub Configuration

### Repository Details
- **URL**: https://github.com/chickenloop3845-commits/chickenloop
- **Owner**: `chickenloop3845-commits`
- **Visibility**: Public
- **Remote**: `git@github.com:chickenloop3845-commits/chickenloop.git` (SSH configured)

### Collaborators
- **Tzwengali**: Added as collaborator with write permissions (invitation pending)

### Git Configuration
- **Local User**: Joco (jhegedus42@gmail.com)
- **GitHub User**: chickenloop3845-commits
- **Authentication**: GitHub CLI (gh) - token stored in keyring
- **SSH**: Configured but key not yet added to GitHub

## SSH Setup Status

### Current State
- SSH keys exist: `~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub`
- Remote configured for SSH: `git@github.com:chickenloop3845-commits/chickenloop.git`
- Public key needs to be added to GitHub for SSH to work
- Currently using HTTPS via GitHub CLI for pushes

### SSH Public Key
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDUEprrg+2uK1PbnfBKypvUsOazPV1kGgYhlyzHLQAMMW9oDsAvFLHFq8+IEEpeUQ6r7nN1MRvU223wD/rL8QLGAhWix+5/eEXfAexPsmxgRGovQVHspHaM8SYIGvxmAh3hMCwnW0wVo0/lGVx+wQRSR+ebqwASJAxEnhybQnSUF2bf1JqfbJe4cDizlVeS2VfN/76D9KunFn5g8Vu299W2bpNFe+r/cX3Beek997Q2dqfiGoKo1JHJeJFCRprZAYZX4XwYOtmfji/WkfF58pD708V0Zq5jCQNg9afeahQwyTaOXYiLADzVXE6GIp2CotT6VX62l8XLymluGzn/9ixZeqSEDhZ2aAfmtImHlYSbmNNqL8gqYZgUKEyM9bjOK+WvfwmT+elQQ/M+RGeLauZsua+Jbe+5CPPkZMIgH7WvcoG2fbQKfnl2e83lYIZJv+U+GP1MAt6yP/jr7Cq+5ffwcfiV2r7dP1vHn8t1e6reD2XEtIqPrTXzW8E0n5ZF/k0= joco@Hegeduss-MacBook-Air.local
```

## Documentation Created

1. **CHAT_SUMMARY.md** - Project overview and key decisions
2. **SETUP_GUIDE.md** - Detailed setup instructions for local development with Cursor IDE
3. **GITHUB_SSH_SETUP.md** - Complete SSH setup guide for GitHub
4. **CONVERSATION_EXPORT.md** - This file (conversation export)

## Vercel Deployment

### Configuration
- **Project Name**: `cl1`
- **Project ID**: `prj_sAjukGZ0mqdwfAMchUKeg6yMtsDr`
- **Auto-deployment**: Enabled (deploys on push to main)
- **Build Command**: `npm run build`
- **Framework**: Next.js

### Deployment Timeline
- Push to GitHub → Vercel detects (seconds)
- Build starts → 1-2 minutes
- Deployment completes → 2-5 minutes total

### Environment Variables (Required)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: JWT token secret key

## MongoDB Atlas Configuration

### Connection Details
- **Database Name**: `chickenloop`
- **IP Whitelist**: `0.0.0.0/0` (Allow Access from Anywhere)
- **Connection**: Via connection string in environment variables

### Models
- **User**: Email, password (hashed), name, role (recruiter/job-seeker/admin)
- **Job**: Title, description, company, location, salary, type, recruiter reference
- **CV**: Personal info, experience, education, skills, jobSeeker reference
- **Company**: Name, description, website, logo (newly added)

## Key Code Patterns

### API Route Pattern (Next.js 16)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await params
  // ... rest of handler
}
```

### Authentication Middleware
```typescript
import { requireAuth, requireRole } from '@/lib/auth';

// Require any authenticated user
requireAuth(request);

// Require specific role
const user = requireRole(request, ['recruiter']);
```

### JWT Token Generation
```typescript
import { generateToken } from '@/lib/jwt';

const token = generateToken(user); // Returns JWT string
```

## Common Commands

### Git Operations
```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push (via HTTPS - works with GitHub CLI)
git push origin main

# Pull latest changes
git pull origin main
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### GitHub CLI
```bash
# Check auth status
gh auth status

# View repository
gh repo view

# Add collaborator
gh api repos/OWNER/REPO/collaborators/USERNAME -X PUT -f permission=push
```

## Current Project State

### Working Features
- ✅ User registration and authentication
- ✅ Role-based access control
- ✅ Job CRUD operations (recruiters)
- ✅ CV CRUD operations (job-seekers)
- ✅ Admin user management
- ✅ Jobs browsing (authenticated users)
- ✅ Company management (recruiters)
- ✅ Logo/company branding

### Pending Tasks
- SSH key needs to be added to GitHub for SSH authentication
- Tzwengali collaborator invitation pending acceptance

## Important Notes

1. **Authentication**: Jobs viewing requires login (not public)
2. **Caching**: Middleware and meta tags prevent stale content
3. **Deployment**: Auto-deploys on push to main branch (2-5 minutes)
4. **SSH**: Configured but not yet active (using HTTPS via GitHub CLI)
5. **Environment**: Each developer needs their own `.env.local` file

## File Structure

```
chickenloop/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/        # Authentication
│   │   ├── jobs/        # Job management
│   │   ├── cv/          # CV management
│   │   ├── admin/       # Admin operations
│   │   └── company/     # Company management (new)
│   ├── admin/           # Admin dashboard
│   ├── recruiter/       # Recruiter dashboard
│   ├── job-seeker/      # Job seeker dashboard
│   ├── jobs/            # Jobs listing page
│   └── components/      # React components
├── lib/                 # Utilities
│   ├── api.ts          # Frontend API client
│   ├── auth.ts         # Auth middleware
│   ├── db.ts           # MongoDB connection
│   └── jwt.ts          # JWT utilities
├── models/             # Mongoose schemas
│   ├── User.ts
│   ├── Job.ts
│   ├── CV.ts
│   └── Company.ts      # New
├── .env.local          # Environment variables (not in git)
├── vercel.json         # Vercel configuration
└── middleware.ts       # Cache control middleware
```

## Next Steps for New Developers

1. Clone repository: `git clone https://github.com/chickenloop3845-commits/chickenloop.git`
2. Install dependencies: `npm install`
3. Create `.env.local` with `MONGODB_URI` and `JWT_SECRET`
4. Set up MongoDB Atlas (see SETUP_GUIDE.md)
5. Run dev server: `npm run dev`
6. Read SETUP_GUIDE.md for detailed instructions

## Questions & Answers from Conversation

### Q: How to push to GitHub?
**A**: Use `git add .`, `git commit -m "message"`, `git push origin main`. GitHub CLI handles authentication automatically.

### Q: What is GitHub CLI?
**A**: Command-line tool (`gh`) that manages GitHub authentication and provides GitHub features in terminal. Already installed and configured.

### Q: How does Vercel deployment work?
**A**: Vercel automatically detects pushes to GitHub main branch and deploys within 2-5 minutes.

### Q: How to add collaborators?
**A**: Use GitHub API: `gh api repos/OWNER/REPO/collaborators/USERNAME -X PUT -f permission=write`

### Q: SSH vs HTTPS?
**A**: SSH is configured but key needs to be added to GitHub. Currently using HTTPS via GitHub CLI which works automatically.

## Export Information

- **Export Date**: 2025-11-17
- **Conversation Context**: Full development conversation for ChickenLoop project
- **Purpose**: Share context with Claude or other developers
- **Format**: Markdown for easy reading and version control

---

**Note**: This export contains all key information from the development conversation. Use it to:
- Continue development with full context
- Onboard new developers
- Share project status with team
- Import into Claude or other AI assistants

