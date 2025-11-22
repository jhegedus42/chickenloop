import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import { requireRole } from '@/lib/auth';

// GET - Get audit logs (admin only)
export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['admin']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const userId = searchParams.get('userId');

    // Build query
    const query: any = {};
    if (action) {
      query.action = action;
    }
    if (entityType) {
      query.entityType = entityType;
    }
    if (userId) {
      query.userId = userId;
    }

    // Get audit logs
    const auditLogs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('userId', 'name email')
      .lean();

    // Get total count for pagination
    const total = await AuditLog.countDocuments(query);

    return NextResponse.json(
      {
        auditLogs,
        total,
        limit,
        offset,
      },
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

