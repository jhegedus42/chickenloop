import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';

// GET - Get all jobs (accessible to all users, including anonymous)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    // Build query filter
    const queryFilter: any = {
      $or: [
        { published: true },
        { published: { $exists: false } }
      ]
    };

    // If featured=true, filter for featured jobs
    if (featured === 'true') {
      queryFilter.featured = true;
    }

    // Get only published jobs (unpublished jobs are hidden from public)
    // Include jobs where published is true OR undefined (default is true)
    // Exclude only jobs where published is explicitly false
    const jobs = await Job.find(queryFilter)
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

