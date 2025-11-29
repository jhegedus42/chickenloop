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
    // Use find with populate and sort in memory to avoid MongoDB sort memory limit
    const cvsRaw = await CV.find({
      published: { $ne: false }
    })
      .populate('jobSeeker', 'name email lastOnline')
      .lean();
    
    // Sort in memory after fetching (avoids MongoDB sort memory limit)
    const cvs = cvsRaw.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order
    });

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

