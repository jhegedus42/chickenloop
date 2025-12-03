import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CV from '@/models/CV';

// GET - Get all published resumes/CVs (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get only published CVs (unpublished CVs are hidden from public)
    // Include CVs where published is true OR undefined (default is true)
    // Exclude only CVs where published is explicitly false
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

    return NextResponse.json({ resumes: cvs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

