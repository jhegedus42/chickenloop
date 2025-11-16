import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';
import CV from '@/models/CV';
import { requireRole } from '@/lib/auth';

// GET - Get all users with their data (admin only)
export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['admin']);
    await connectDB();

    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Get additional data for each user
    const usersWithData = await Promise.all(
      users.map(async (user) => {
        let additionalData: any = {};

        if (user.role === 'recruiter') {
          const jobs = await Job.find({ recruiter: user._id });
          additionalData.jobs = jobs;
        } else if (user.role === 'job-seeker') {
          const cv = await CV.findOne({ jobSeeker: user._id });
          additionalData.cv = cv;
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          ...additionalData,
        };
      })
    );

    return NextResponse.json({ users: usersWithData }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

