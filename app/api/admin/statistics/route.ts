import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';
import CV from '@/models/CV';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Get statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['admin']);
    
    // Add timeout for database connection
    const dbPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000)
    );
    await Promise.race([dbPromise, timeoutPromise]);

    const dbConnection = mongoose.connection.db;
    if (!dbConnection) {
      throw new Error('Database object not available');
    }

    // Get counts using native MongoDB driver for better performance
    const [jobSeekersCount, recruitersCount, jobsCount, cvsCount, companiesCount] = await Promise.all([
      dbConnection.collection('users').countDocuments({ role: 'job-seeker' }),
      dbConnection.collection('users').countDocuments({ role: 'recruiter' }),
      dbConnection.collection('jobs').countDocuments({}),
      dbConnection.collection('cvs').countDocuments({}),
      dbConnection.collection('companies').countDocuments({}),
    ]);

    return NextResponse.json({
      statistics: {
        jobSeekers: jobSeekersCount,
        recruiters: recruitersCount,
        jobs: jobsCount,
        cvs: cvsCount,
        companies: companiesCount,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API /admin/statistics] Error:', error);
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

