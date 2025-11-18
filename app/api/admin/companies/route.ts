import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';
import { requireRole } from '@/lib/auth';

// GET - Get all companies (admin only)
export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['admin']);
    await connectDB();

    const companies = await Company.find().populate('owner', 'name email').sort({ createdAt: -1 });

    const companiesWithData = companies.map((company) => ({
      id: company._id,
      name: company.name,
      description: company.description,
      location: company.location,
      website: company.website,
      owner: company.owner,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    return NextResponse.json({ companies: companiesWithData }, { status: 200 });
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

