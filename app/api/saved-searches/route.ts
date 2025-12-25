import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SavedSearch from '@/models/SavedSearch';
import { requireAuth } from '@/lib/auth';

// GET - Get all saved searches for the current user
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const savedSearches = await SavedSearch.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ savedSearches }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.error('[API /saved-searches GET] Error:', error);
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new saved search
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    await connectDB();

    const { name, keyword, location, country, category, sport, language, frequency } = await request.json();

    // Validate frequency
    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Frequency must be "daily" or "weekly"' },
        { status: 400 }
      );
    }

    // At least one filter must be provided
    if (!keyword && !location && !country && !category && !sport && !language) {
      return NextResponse.json(
        { error: 'At least one filter must be provided' },
        { status: 400 }
      );
    }

    const savedSearch = await SavedSearch.create({
      userId: user.userId,
      name: name || undefined,
      keyword: keyword || undefined,
      location: location || undefined,
      country: country || undefined,
      category: category || undefined,
      sport: sport || undefined,
      language: language || undefined,
      frequency: frequency || 'daily',
      active: true,
    });

    return NextResponse.json(
      {
        message: 'Saved search created successfully',
        savedSearch,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.error('[API /saved-searches POST] Error:', error);
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

