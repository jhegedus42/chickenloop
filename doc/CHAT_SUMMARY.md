# Chat Summary - ChickenLoop Development

This document summarizes the development conversation for the ChickenLoop watersports job platform.

## Project Overview

**ChickenLoop** - A job website for watersports with three user types:
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

## Key Features Implemented

1. **Authentication System**
   - User registration with role selection (recruiter, job-seeker, admin)
   - JWT-based login/logout
   - Role-based access control
   - Protected API routes

2. **Job Management** (Recruiters)
   - Create, read, update, delete jobs
   - View own posted jobs
   - Jobs include: title, description, company, location, salary, type

3. **CV Management** (Job Seekers)
   - Create, edit, delete CV
   - CV form with personal information, experience, education, skills

4. **Admin Dashboard**
   - View all users
   - Edit user data
   - Delete users
   - View associated data (jobs for recruiters, CVs for job seekers)

5. **Public Job Browsing**
   - Jobs page accessible to all authenticated users
   - Home page shows job previews for logged-in job seekers

## Important Files

### API Routes
- `app/api/auth/*` - Authentication endpoints
- `app/api/jobs/*` - Job CRUD operations
- `app/api/cv/*` - CV management
- `app/api/admin/*` - Admin user management

### Models
- `models/User.ts` - User schema with roles
- `models/Job.ts` - Job schema
- `models/CV.ts` - CV schema

### Frontend
- `app/page.tsx` - Home page
- `app/jobs/page.tsx` - Jobs listing page
- `app/components/Navbar.tsx` - Navigation component
- `app/contexts/AuthContext.tsx` - Authentication context

### Configuration
- `lib/db.ts` - MongoDB connection
- `lib/auth.ts` - Authentication middleware
- `lib/jwt.ts` - JWT token utilities
- `middleware.ts` - Cache control headers

## Deployment

- **Repository**: https://github.com/chickenloop3845-commits/chickenloop
- **Deployment**: Vercel (auto-deploys on push to main)
- **Database**: MongoDB Atlas
- **Environment Variables**:
  - `MONGODB_URI` - MongoDB Atlas connection string
  - `JWT_SECRET` - Secret key for JWT tokens

## Key Decisions Made

1. **Next.js 16 Compatibility**: Updated dynamic route handlers to handle `params` as a Promise
2. **Caching**: Added middleware and meta tags to prevent stale content issues
3. **Authentication**: Jobs API requires authentication (user rejected making it public)
4. **Navigation**: Jobs link only visible to job-seekers in navbar

## Current Status

- ✅ All features implemented
- ✅ Deployed to Vercel
- ✅ MongoDB Atlas configured
- ✅ GitHub repository connected
- ✅ Auto-deployment enabled

## To Continue Development

1. Clone the repository:
   ```bash
   git clone https://github.com/chickenloop3845-commits/chickenloop.git
   cd chickenloop
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Access the app at `http://localhost:3000`

## Notes for New Developers

- The project uses TypeScript
- Authentication is handled via HTTP-only cookies
- All API routes are protected except registration/login
- Jobs viewing requires authentication
- Admin routes require admin role
- CV routes require job-seeker role
- Job creation/editing requires recruiter role

