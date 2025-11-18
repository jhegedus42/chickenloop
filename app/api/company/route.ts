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

    const company = await Company.create({
      name,
      description,
      address,
      coordinates,
      website,
      socialMedia,
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

    if (name) company.name = name;
    if (description !== undefined) company.description = description;
    if (address !== undefined) company.address = address;
    if (coordinates !== undefined) company.coordinates = coordinates;
    if (website !== undefined) company.website = website;
    if (socialMedia !== undefined) company.socialMedia = socialMedia;

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


