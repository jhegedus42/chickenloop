import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireRole } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST - Upload company logo (recruiters and admins)
export async function POST(request: NextRequest) {
  try {
    requireRole(request, ['recruiter', 'admin']);

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

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `companies/logo-${timestamp}-${randomStr}.${extension}`;

    const useBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;
    let url: string;

    if (useBlobStorage) {
      // Upload to Vercel Blob (production)
      const blob = await put(filename, file, { access: 'public' });
      url = blob.url;
    } else {
      // Fallback to filesystem storage (local development)
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'companies', 'logos');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const filePath = join(uploadDir, `logo-${timestamp}-${randomStr}.${extension}`);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      url = `/uploads/companies/logos/logo-${timestamp}-${randomStr}.${extension}`;
    }

    return NextResponse.json(
      {
        message: 'Logo uploaded successfully',
        url: url,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[API /company/upload-logo] Error:', error);
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}
