import { NextRequest, NextResponse } from 'next/server';
import CV from '@/models/CV';
import connectDB from '@/lib/db';
import { requireRole } from '@/lib/auth';

// GET - Get all CVs (recruiters and admins only)
export async function GET(request: NextRequest) {
  console.log('API: /api/candidates-list called');
  try {
    const user = requireRole(request, ['recruiter', 'admin']);
    console.log('API: /api/candidates-list - User authorized:', user.email);

    await connectDB();
    console.log('API: /api/candidates-list - DB connected');

    // Use aggregation with optimized $lookup for better performance
    // Only select fields needed for the listing page
    const startTime = Date.now();
    
    const cvs = await CV.aggregate([
      // Match only published CVs (uses compound index)
      {
        $match: {
          published: { $ne: false }
        }
      },
      // Sort by createdAt descending (uses index) - do this early
      {
        $sort: { createdAt: -1 }
      },
      // Project CV fields first to reduce data size before lookup
      {
        $project: {
          _id: 1,
          fullName: 1,
          summary: 1,
          address: 1,
          experienceAndSkill: 1,
          lookingForWorkInAreas: 1,
          languages: 1,
          professionalCertifications: 1,
          pictures: { $slice: ['$pictures', 1] }, // Only first picture
          createdAt: 1,
          jobSeeker: 1 // Keep for lookup
        }
      },
      // Lookup jobSeeker info with limited fields only (after reducing CV data)
      {
        $lookup: {
          from: 'users',
          localField: 'jobSeeker',
          foreignField: '_id',
          as: 'jobSeekerInfo',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                lastOnline: 1
              }
            }
          ]
        }
      },
      // Unwind jobSeeker array (should be single element)
      {
        $unwind: {
          path: '$jobSeekerInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      // Final projection with jobSeeker data
      {
        $project: {
          _id: 1,
          fullName: 1,
          summary: 1,
          address: 1,
          experienceAndSkill: 1,
          lookingForWorkInAreas: 1,
          languages: 1,
          professionalCertifications: 1,
          pictures: 1,
          createdAt: 1,
          jobSeeker: {
            _id: '$jobSeekerInfo._id',
            name: '$jobSeekerInfo.name',
            email: '$jobSeekerInfo.email',
            lastOnline: '$jobSeekerInfo.lastOnline'
          }
        }
      }
    ]).allowDiskUse(true); // Allow disk use for large result sets

    const queryTime = Date.now() - startTime;
    console.log(`API: /api/candidates-list - Found ${cvs.length} CVs in ${queryTime}ms`);

    // Extract unique values for filters on the backend (more efficient)
    const uniqueLanguages = new Set<string>();
    const uniqueWorkAreas = new Set<string>();
    const uniqueSports = new Set<string>();
    const uniqueCertifications = new Set<string>();

    cvs.forEach((cv: any) => {
      if (cv.languages) {
        cv.languages.forEach((lang: string) => uniqueLanguages.add(lang));
      }
      if (cv.lookingForWorkInAreas) {
        cv.lookingForWorkInAreas.forEach((area: string) => uniqueWorkAreas.add(area));
      }
      if (cv.experienceAndSkill) {
        cv.experienceAndSkill.forEach((sport: string) => uniqueSports.add(sport));
      }
      if (cv.professionalCertifications) {
        cv.professionalCertifications.forEach((cert: string) => uniqueCertifications.add(cert));
      }
    });

    return NextResponse.json({
      cvs,
      filters: {
        languages: Array.from(uniqueLanguages).sort(),
        workAreas: Array.from(uniqueWorkAreas).sort(),
        sports: Array.from(uniqueSports).sort(),
        certifications: Array.from(uniqueCertifications).sort(),
      }
    }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API: /api/candidates-list - Error:', error);
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    );
  }
}

