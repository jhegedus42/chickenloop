import { NextRequest, NextResponse } from 'next/server';

// Search for locations using OpenStreetMap Nominatim API (autocomplete)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Call Nominatim API for search/autocomplete
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=10&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Chickenloop/1.0 (contact@chickenloop.com)', // Required by Nominatim TOS
        'Accept-Language': 'en', // Request English language for country names
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Search service unavailable' },
        { status: 503 }
      );
    }

    const data = await response.json();

    // Format the results to include display name, coordinates, and address components
    // Store country as ISO 3166-1 alpha-2 code (e.g., 'US', 'GB', 'FR')
    const results = data.map((item: any) => {
      const address = item.address || {};
      return {
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        address: {
          street: address.road || address.pedestrian || address.footway || '',
          city: address.city || address.town || address.village || address.municipality || '',
          state: address.state || address.region || '',
          postalCode: address.postcode || '',
          country: address.country_code?.toUpperCase() || '', // ISO 3166-1 alpha-2 code
        },
      };
    });

    return NextResponse.json({ results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

