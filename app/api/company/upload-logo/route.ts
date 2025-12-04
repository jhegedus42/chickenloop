import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { requireRole } from '@/lib/auth';

// POST - Upload company logo (recruiters and admins)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter', 'admin']);
    
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only images (JPEG, PNG, WEBP, GIF) are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File ${file.name} is too large. Maximum size is 5MB.` },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'companies');
    
    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `logo-${timestamp}-${randomStr}.${extension}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);
    const url = `/uploads/companies/${filename}`;

    return NextResponse.json(
      { 
        message: 'Logo uploaded successfully',
        url: url,
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
    console.error('[API /company/upload-logo] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

