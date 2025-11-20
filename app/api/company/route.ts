import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';
import { requireRole } from '@/lib/auth';

// GET - Get current recruiter's company
export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();

    const company = await Company.findOne({ owner: user.userId });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });
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

// POST - Create a new company (recruiters only, one per recruiter)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();

    // Check if recruiter already has a company
    const existingCompany = await Company.findOne({ owner: user.userId });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'You already have a company. You can only have one company.' },
        { status: 400 }
      );
    }

    const { name, description, address, coordinates, website, socialMedia } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Validate that coordinates are required
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return NextResponse.json(
        { error: 'Geolocation coordinates are required. Please search for and select a location.' },
        { status: 400 }
      );
    }

    // Clean up empty strings in nested objects
    let cleanedAddress = address;
    if (address) {
      cleanedAddress = {
        street: address.street?.trim() || undefined,
        city: address.city?.trim() || undefined,
        state: address.state?.trim() || undefined,
        postalCode: address.postalCode?.trim() || undefined,
        country: address.country?.trim().toUpperCase() || undefined,
      };
      // If all fields are undefined, set to undefined
      if (!cleanedAddress.street && !cleanedAddress.city && !cleanedAddress.state && 
          !cleanedAddress.postalCode && !cleanedAddress.country) {
        cleanedAddress = undefined;
      }
    }

    let cleanedSocialMedia = socialMedia;
    if (socialMedia) {
      cleanedSocialMedia = {
        facebook: socialMedia.facebook?.trim() || undefined,
        instagram: socialMedia.instagram?.trim() || undefined,
        tiktok: socialMedia.tiktok?.trim() || undefined,
        youtube: socialMedia.youtube?.trim() || undefined,
      };
      // If all fields are undefined, set to undefined
      if (!cleanedSocialMedia.facebook && !cleanedSocialMedia.instagram && 
          !cleanedSocialMedia.tiktok && !cleanedSocialMedia.youtube) {
        cleanedSocialMedia = undefined;
      }
    }

    const company = await Company.create({
      name,
      description,
      address: cleanedAddress,
      coordinates: coordinates || undefined,
      website: website?.trim() || undefined,
      socialMedia: cleanedSocialMedia,
      owner: user.userId,
    });

    return NextResponse.json(
      { message: 'Company created successfully', company },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You already have a company' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update recruiter's company
export async function PUT(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();

    const company = await Company.findOne({ owner: user.userId });
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const { name, description, address, coordinates, website, socialMedia } = await request.json();

    // Validate that coordinates are required for updates
    if (coordinates === undefined || coordinates === null || !coordinates.latitude || !coordinates.longitude) {
      return NextResponse.json(
        { error: 'Geolocation coordinates are required. Please search for and select a location.' },
        { status: 400 }
      );
    }

    if (name) company.name = name;
    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    
    // Update nested objects properly - normalize empty strings to undefined
    if (address !== undefined) {
      if (!company.address) company.address = {};
      if (address.street !== undefined) company.address.street = address.street?.trim() || undefined;
      if (address.city !== undefined) company.address.city = address.city?.trim() || undefined;
      if (address.state !== undefined) company.address.state = address.state?.trim() || undefined;
      if (address.postalCode !== undefined) company.address.postalCode = address.postalCode?.trim() || undefined;
      if (address.country !== undefined) company.address.country = address.country?.trim().toUpperCase() || undefined;
      company.markModified('address');
    }
    
    if (coordinates !== undefined && coordinates !== null) {
      if (!company.coordinates) company.coordinates = { latitude: 0, longitude: 0 };
      if (coordinates.latitude !== undefined && coordinates.latitude !== null) company.coordinates.latitude = coordinates.latitude;
      if (coordinates.longitude !== undefined && coordinates.longitude !== null) company.coordinates.longitude = coordinates.longitude;
      company.markModified('coordinates');
    }
    
    if (socialMedia !== undefined) {
      if (!company.socialMedia) company.socialMedia = {};
      if (socialMedia.facebook !== undefined) company.socialMedia.facebook = socialMedia.facebook?.trim() || undefined;
      if (socialMedia.instagram !== undefined) company.socialMedia.instagram = socialMedia.instagram?.trim() || undefined;
      if (socialMedia.tiktok !== undefined) company.socialMedia.tiktok = socialMedia.tiktok?.trim() || undefined;
      if (socialMedia.youtube !== undefined) company.socialMedia.youtube = socialMedia.youtube?.trim() || undefined;
      company.markModified('socialMedia');
    }

    await company.save();

    return NextResponse.json(
      { message: 'Company updated successfully', company },
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


