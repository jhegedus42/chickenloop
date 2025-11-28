import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CV from '@/models/CV';
import { requireRole } from '@/lib/auth';

// GET - Get a single CV (recruiters and admins only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(request, ['recruiter', 'admin']);
    await connectDB();

    const { id } = await params;
    const cv = await CV.findById(id).populate('jobSeeker', 'name email lastOnline');

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    return NextResponse.json({ cv }, { status: 200 });
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

