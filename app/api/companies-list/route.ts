import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';

// GET - Get all companies (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const companies = await Company.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Clean up social media fields for all companies
    const cleanedCompanies = companies.map((company: any) => {
      let cleanedSocialMedia = company.socialMedia;
      if (cleanedSocialMedia) {
        cleanedSocialMedia = {
          facebook: cleanedSocialMedia.facebook?.trim() || undefined,
          instagram: cleanedSocialMedia.instagram?.trim() || undefined,
          tiktok: cleanedSocialMedia.tiktok?.trim() || undefined,
          youtube: cleanedSocialMedia.youtube?.trim() || undefined,
          twitter: cleanedSocialMedia.twitter?.trim() || undefined,
        };
        // If all fields are undefined, set to undefined
        if (!cleanedSocialMedia.facebook && !cleanedSocialMedia.instagram && 
            !cleanedSocialMedia.tiktok && !cleanedSocialMedia.youtube && 
            !cleanedSocialMedia.twitter) {
          cleanedSocialMedia = undefined;
        }
      }

      return {
        id: company._id,
        name: company.name,
        description: company.description,
        address: company.address,
        coordinates: company.coordinates,
        website: company.website,
        contact: company.contact,
        socialMedia: cleanedSocialMedia,
        offeredActivities: company.offeredActivities,
        offeredServices: company.offeredServices,
        logo: company.logo,
        pictures: company.pictures,
        owner: company.owner,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      };
    });

    return NextResponse.json({ companies: cleanedCompanies }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

