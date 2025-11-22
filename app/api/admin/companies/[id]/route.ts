import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';
import Job from '@/models/Job';
import { requireRole } from '@/lib/auth';
import { createDeleteAuditLog } from '@/lib/audit';

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
        address: company.address,
        coordinates: company.coordinates,
        website: company.website,
        socialMedia: company.socialMedia,
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
    const user = requireRole(request, ['admin']);
    await connectDB();
    const { id } = await params;

    const company = await Company.findById(id);
    
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Count jobs that will be deleted
    const jobsCount = await Job.countDocuments({ companyId: company._id });

    // Store company data for audit log before deletion
    const companyData = {
      id: String(company._id),
      name: company.name,
      owner: company.owner ? String(company.owner) : undefined,
      jobsCount,
    };

    // Delete associated jobs
    await Job.deleteMany({ companyId: company._id });

    // Delete the company
    await Company.findByIdAndDelete(id);

    // Create audit log
    await createDeleteAuditLog(request, {
      entityType: 'company',
      entityId: id,
      userId: user.userId,
      before: companyData,
      reason: `Deleted company "${company.name}" and ${jobsCount} associated job(s)`,
      metadata: { jobsDeleted: jobsCount },
    });

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

