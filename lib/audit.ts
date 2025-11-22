import { NextRequest } from 'next/server';
import AuditLog from '@/models/AuditLog';
import connectDB from '@/lib/db';
import User from '@/models/User';

export interface AuditLogData {
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'register';
  entityType: 'user' | 'company' | 'job' | 'cv';
  entityId?: string;
  userId: string;
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return undefined;
}

/**
 * Get user agent from request
 */
function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  request: NextRequest,
  data: AuditLogData
): Promise<void> {
  try {
    await connectDB();

    // Get user details
    const user = await User.findById(data.userId);
    if (!user) {
      console.error('User not found for audit log:', data.userId);
      return;
    }

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    await AuditLog.create({
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      userEmail: user.email,
      userName: user.name,
      changes: data.changes,
      reason: data.reason,
      ipAddress,
      userAgent,
      metadata: data.metadata,
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Create audit log for deletion with before state
 */
export async function createDeleteAuditLog(
  request: NextRequest,
  data: {
    entityType: 'user' | 'company' | 'job' | 'cv';
    entityId: string;
    userId: string;
    before: any;
    reason?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  await createAuditLog(request, {
    action: 'delete',
    entityType: data.entityType,
    entityId: data.entityId,
    userId: data.userId,
    changes: {
      before: data.before,
    },
    reason: data.reason,
    metadata: data.metadata,
  });
}

/**
 * Create audit log for update with before/after states
 */
export async function createUpdateAuditLog(
  request: NextRequest,
  data: {
    entityType: 'user' | 'company' | 'job' | 'cv';
    entityId: string;
    userId: string;
    before: any;
    after: any;
    fields?: string[];
    reason?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  await createAuditLog(request, {
    action: 'update',
    entityType: data.entityType,
    entityId: data.entityId,
    userId: data.userId,
    changes: {
      before: data.before,
      after: data.after,
      fields: data.fields,
    },
    reason: data.reason,
    metadata: data.metadata,
  });
}

/**
 * Create audit log for creation
 */
export async function createCreateAuditLog(
  request: NextRequest,
  data: {
    entityType: 'user' | 'company' | 'job' | 'cv';
    entityId: string;
    userId: string;
    after: any;
    reason?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  await createAuditLog(request, {
    action: 'create',
    entityType: data.entityType,
    entityId: data.entityId,
    userId: data.userId,
    changes: {
      after: data.after,
    },
    reason: data.reason,
    metadata: data.metadata,
  });
}

