import { NextRequest, NextResponse } from 'next/server';

// Geocode an address using OpenStreetMap Nominatim API (free, no API key required)
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Build the address string from the address object
    const addressParts: string[] = [];
    if (address.street) addressParts.push(address.street);
    if (address.city) addressParts.push(address.city);
    if (address.state) addressParts.push(address.state);
    if (address.postalCode) addressParts.push(address.postalCode);
    if (address.country) addressParts.push(address.country);

    const addressString = addressParts.join(', ');

    if (!addressString) {
      return NextResponse.json(
        { error: 'At least one address field is required' },
        { status: 400 }
      );
    }

    // Call Nominatim API
    const encodedAddress = encodeURIComponent(addressString);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Chickenloop/1.0 (contact@chickenloop.com)', // Required by Nominatim TOS
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 503 }
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid geocoding response' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        latitude,
        longitude,
        displayName: result.display_name,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}




