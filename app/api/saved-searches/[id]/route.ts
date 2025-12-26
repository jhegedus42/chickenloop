import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavedSearch from '@/models/SavedSearch';
import { requireAuth } from '@/lib/auth';

// PATCH - Update a saved search
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    await connectDB();
    const { id } = await params;

    const updates = await request.json();

    // Validate frequency if provided
    if (updates.frequency && !['daily', 'weekly'].includes(updates.frequency)) {
      return NextResponse.json(
        { error: 'Frequency must be "daily" or "weekly"' },
        { status: 400 }
      );
    }

    const savedSearch = await SavedSearch.findById(id);
    if (!savedSearch) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
    }

    // Verify user owns this saved search
    if (savedSearch.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        (savedSearch as any)[key] = updates[key];
      }
    });

    await savedSearch.save();

    return NextResponse.json(
      {
        message: 'Saved search updated successfully',
        savedSearch,
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
    
    console.error('[API /saved-searches/[id] PATCH] Error:', error);
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a saved search
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    await connectDB();
    const { id } = await params;

    const savedSearch = await SavedSearch.findById(id);
    if (!savedSearch) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
    }

    // Verify user owns this saved search
    if (savedSearch.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await SavedSearch.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Saved search deleted successfully' },
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
    
    console.error('[API /saved-searches/[id] DELETE] Error:', error);
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

