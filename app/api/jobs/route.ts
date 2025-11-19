import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Company from '@/models/Company';
import { requireAuth, requireRole } from '@/lib/auth';

// GET - Get all jobs (accessible to all users, including anonymous)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const jobs = await Job.find().populate('recruiter', 'name email').sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error: any) {
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

    // Check if recruiter has a company
    const company = await Company.findOne({ owner: user.userId });
    if (!company) {
      return NextResponse.json(
        { error: 'You must create a company profile before posting jobs' },
        { status: 400 }
      );
    }

    const { title, description, location, salary, type, pictures } = await request.json();

    if (!title || !description || !location || !type) {
      return NextResponse.json(
        { error: 'Title, description, location, and type are required' },
        { status: 400 }
      );
    }

    // Validate pictures array (max 3)
    if (pictures && Array.isArray(pictures) && pictures.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 pictures allowed' },
        { status: 400 }
      );
    }

    const job = await Job.create({
      title,
      description,
      company: company.name,
      companyId: company._id,
      location,
      salary,
      type,
      pictures: pictures || [],
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

