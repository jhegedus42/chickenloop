import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import { requireAuth, requireRole } from '@/lib/auth';

// GET - Get a single job (accessible to all users, including anonymous)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const job = await Job.findById(id).populate('recruiter', 'name email');
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a job (recruiters can only update their own jobs)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();
    const { id } = await params;

    const job = await Job.findById(id);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.recruiter.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own jobs' },
        { status: 403 }
      );
    }

    const { title, description, company, location, country, salary, type, languages, pictures } = await request.json();

    if (title) job.title = title;
    if (description) job.description = description;
    if (company) job.company = company;
    if (location) job.location = location;
    if (country !== undefined) {
      if (!country || country.trim() === '') {
        return NextResponse.json(
          { error: 'Country is required' },
          { status: 400 }
        );
      }
      job.country = country;
    }
    // If country is not provided and job doesn't have one, require it
    if (!job.country || job.country.trim() === '') {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      );
    }
    if (salary !== undefined) job.salary = salary;
    if (type) job.type = type;
    if (languages !== undefined) {
      if (Array.isArray(languages) && languages.length > 3) {
        return NextResponse.json(
          { error: 'Maximum 3 languages allowed' },
          { status: 400 }
        );
      }
      job.languages = languages || [];
    }
    if (pictures !== undefined) {
      if (Array.isArray(pictures) && pictures.length > 3) {
        return NextResponse.json(
          { error: 'Maximum 3 pictures allowed' },
          { status: 400 }
        );
      }
      job.pictures = pictures || [];
    }

    await job.save();

    const updatedJob = await Job.findById(job._id).populate('recruiter', 'name email');

    return NextResponse.json(
      { message: 'Job updated successfully', job: updatedJob },
      { status: 200 }
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

// DELETE - Delete a job (recruiters can only delete their own jobs)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();
    const { id } = await params;

    const job = await Job.findById(id);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.recruiter.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own jobs' },
        { status: 403 }
      );
    }

    await Job.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Job deleted successfully' },
      { status: 200 }
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

