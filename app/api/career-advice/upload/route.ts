import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireRole } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST - Upload career advice picture (admin only)
export async function POST(request: NextRequest) {
  try {
    requireRole(request, ['admin']);

    const formData = await request.formData();
    const file = formData.get('picture') as File;

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
    const filename = `career-advice/article-${timestamp}-${randomStr}.${extension}`;

    const useBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN;
    
    console.log('[Upload] Storage method:', useBlobStorage ? 'Vercel Blob Storage' : 'Local filesystem');

    let fileUrl: string;

    if (useBlobStorage) {
      // Upload to Vercel Blob (production)
      const blob = await put(filename, file, { access: 'public' });
      console.log('[Upload] Uploaded to Blob Storage:', blob.url);
      fileUrl = blob.url;
    } else {
      // Fallback to filesystem storage (local development)
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'career-advice');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const filePath = join(uploadDir, `${timestamp}-${randomStr}.${extension}`);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      const localPath = `/uploads/career-advice/${timestamp}-${randomStr}.${extension}`;
      console.log('[Upload] Saved to local filesystem:', localPath);
      fileUrl = localPath;
    }

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        url: fileUrl,
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
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

