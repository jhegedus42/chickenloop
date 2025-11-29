import { NextRequest, NextResponse } from 'next/server';
import CV from '@/models/CV';
import connectDB from '@/lib/db';
import { requireRole } from '@/lib/auth';

// GET - Get all CVs (recruiters and admins only)
export async function GET(request: NextRequest) {
  console.log('API: /api/candidates-list called');
  try {
    const user = requireRole(request, ['recruiter', 'admin']);
    console.log('API: /api/candidates-list - User authorized:', user.email);

    await connectDB();
    console.log('API: /api/candidates-list - DB connected');

    const cvs = await CV.find()
      .populate('jobSeeker', 'name email lastOnline')
      .sort({ createdAt: -1 });

    console.log(`API: /api/candidates-list - Found ${cvs.length} CVs`);

    return NextResponse.json({ cvs }, { status: 200 });
  } catch (error: any) {
    console.error('API: /api/candidates-list - Error:', error);
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

