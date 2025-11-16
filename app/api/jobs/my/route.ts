import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import { requireRole } from '@/lib/auth';

// GET - Get all jobs posted by the current recruiter
export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();

    const jobs = await Job.find({ recruiter: user.userId })
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
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

