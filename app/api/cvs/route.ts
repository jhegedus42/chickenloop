import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CV from '@/models/CV';
import { requireRole } from '@/lib/auth';

// GET - Get all CVs (recruiters and admins only)
export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter', 'admin']);
    await connectDB();

    const cvs = await CV.find()
      .populate('jobSeeker', 'name email lastOnline')
      .sort({ createdAt: -1 });

    return NextResponse.json({ cvs }, { status: 200 });
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

