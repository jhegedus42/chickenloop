import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import { requireRole } from '@/lib/auth';

// GET - Get all jobs (admin only)
export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['admin']);
    await connectDB();

    const jobs = await Job.find()
      .lean() // Get plain JavaScript objects instead of Mongoose documents
      .populate('recruiter', 'name email')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    const jobsWithData = jobs.map((job: any) => {
      // Access spam field - will be 'yes', 'no', or undefined (defaults to 'no')
      const spamStatus = job.spam === 'yes' ? 'yes' : 'no';
      return {
        id: job._id,
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        country: job.country,
        salary: job.salary,
        type: job.type,
        languages: job.languages || [],
        qualifications: job.qualifications || [],
        pictures: job.pictures || [],
        spam: spamStatus,
        published: job.published !== false, // Default to true if not explicitly false
        recruiter: job.recruiter,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      };
    });

    return NextResponse.json({ jobs: jobsWithData }, { status: 200 });
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


