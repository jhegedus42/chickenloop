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

    // Get only published CVs (unpublished CVs are hidden from recruiters/admins)
    // Include CVs where published is true OR undefined (default is true)
    // Exclude only CVs where published is explicitly false
    // Use MongoDB sort with index for better performance
    const cvs = await CV.find({
      published: { $ne: false }
    })
      .populate('jobSeeker', 'name email lastOnline')
      .sort({ createdAt: -1 }) // Use MongoDB sort with index
      .lean()
      .exec();

    console.log(`API: /api/candidates-list - Found ${cvs.length} CVs`);

    return NextResponse.json({ cvs }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API: /api/candidates-list - Error:', error);
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

