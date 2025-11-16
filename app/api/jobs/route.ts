import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import { requireAuth, requireRole } from '@/lib/auth';

// GET - Get all jobs (accessible to all authenticated users)
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    await connectDB();

    const jobs = await Job.find().populate('recruiter', 'name email').sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new job (recruiters only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();

    const { title, description, company, location, salary, type } = await request.json();

    if (!title || !description || !company || !location || !type) {
      return NextResponse.json(
        { error: 'Title, description, company, location, and type are required' },
        { status: 400 }
      );
    }

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      type,
      recruiter: user.userId,
    });

    const populatedJob = await Job.findById(job._id).populate('recruiter', 'name email');

    return NextResponse.json(
      { message: 'Job created successfully', job: populatedJob },
      { status: 201 }
    );
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

