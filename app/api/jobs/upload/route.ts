import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { requireRole } from '@/lib/auth';

// POST - Upload job pictures (recruiters only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter']);
    
    const formData = await request.formData();
    const files = formData.getAll('pictures') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (files.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 pictures allowed' },
        { status: 400 }
      );
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'jobs');
    
    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedPaths: string[] = [];

    for (const file of files) {
      if (!file || !(file instanceof File)) {
        continue;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only images (JPEG, PNG, WEBP, GIF) are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size (max 5MB per image)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 5MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `job-${timestamp}-${randomStr}.${extension}`;
      const filepath = join(uploadsDir, filename);

      await writeFile(filepath, buffer);
      uploadedPaths.push(`/uploads/jobs/${filename}`);
    }

    return NextResponse.json(
      { 
        message: 'Files uploaded successfully',
        paths: uploadedPaths,
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




