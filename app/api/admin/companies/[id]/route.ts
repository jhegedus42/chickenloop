import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';
import Job from '@/models/Job';
import { requireRole } from '@/lib/auth';

// GET - Get a single company (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ['admin']);
    await connectDB();
    const { id } = await params;

    const company = await Company.findById(id).populate('owner', 'name email');
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      company: {
        id: company._id,
        name: company.name,
        description: company.description,
        location: company.location,
        website: company.website,
        owner: company.owner,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
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

// PUT - Update a company (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ['admin']);
    await connectDB();
    const { id } = await params;

    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { name, description, location, website } = await request.json();

    if (name) company.name = name;
    if (description !== undefined) company.description = description;
    if (location !== undefined) company.location = location;
    if (website !== undefined) company.website = website;

    await company.save();

    const updatedCompany = await Company.findById(company._id).populate('owner', 'name email');

    return NextResponse.json(
      { message: 'Company updated successfully', company: updatedCompany },
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

// DELETE - Delete a company (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ['admin']);
    await connectDB();
    const { id } = await params;

    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Delete associated jobs
    await Job.deleteMany({ companyId: company._id });

    // Delete the company
    await Company.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Company deleted successfully' },
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

