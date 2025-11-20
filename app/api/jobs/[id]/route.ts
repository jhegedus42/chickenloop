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

    // Convert to plain object and ensure all fields are included, including country
    const jobObject = job.toObject();
    // Handle country field - normalize if it exists, ensure field is always present
    const countryValue = jobObject.country != null && typeof jobObject.country === 'string'
      ? (jobObject.country.trim() ? jobObject.country.trim().toUpperCase() : null)
      : jobObject.country; // Preserve null if explicitly set, or undefined if never set
    
    const jobResponse = {
      ...jobObject,
      country: countryValue,
    };

    return NextResponse.json({ job: jobResponse }, { status: 200 });
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

    const { title, description, company, location, country, salary, type, languages, qualifications, pictures } = await request.json();

    if (title) job.title = title;
    if (description) job.description = description;
    if (company) job.company = company;
    if (location) job.location = location;
    if (country !== undefined) {
      // Normalize country: trim and uppercase, or set to null if empty (null explicitly stores the field)
      job.country = country?.trim() ? country.trim().toUpperCase() : null;
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
    if (qualifications !== undefined) {
      job.qualifications = qualifications || [];
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
    
    // Convert to plain object and ensure all fields are included, including country
    const jobObject = updatedJob?.toObject();
    const jobResponse = jobObject ? {
      ...jobObject,
      // Handle country field - normalize if it exists, preserve null/undefined appropriately
      country: jobObject.country != null 
        ? (jobObject.country.trim() ? jobObject.country.trim().toUpperCase() : null)
        : undefined,
    } : updatedJob;

    return NextResponse.json(
      { message: 'Job updated successfully', job: jobResponse },
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

