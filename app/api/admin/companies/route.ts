import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Company from '@/models/Company';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Get all companies (admin only)
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[API /admin/companies] Starting request');
  try {
    requireRole(request, ['admin']);
    
    // Add timeout for database connection
    const dbPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000)
    );
    await Promise.race([dbPromise, timeoutPromise]);
    console.log(`[API /admin/companies] Database connected in ${Date.now() - startTime}ms`);

    const dbConnection = mongoose.connection.db;
    if (!dbConnection) {
      throw new Error('Database object not available');
    }

    console.log('[API /admin/companies] Fetching companies with simple query...');
    const queryStart = Date.now();

    // Use simple find query instead of complex aggregation - much faster
    const companies = await dbConnection.collection('companies')
      .find({})
      .sort({ createdAt: -1 })
      .limit(200) // Limit to prevent timeout
      .maxTimeMS(10000) // 10 second timeout
      .toArray();
    
    // Manually populate owner info
    const ownerIds = [...new Set(companies.map((c: any) => c.owner).filter(Boolean))];
    const owners = ownerIds.length > 0
      ? await dbConnection.collection('users')
          .find({ _id: { $in: ownerIds } }, { projection: { name: 1, email: 1 } })
          .maxTimeMS(5000)
          .toArray()
      : [];
    const ownerMap = new Map(owners.map((o: any) => [o._id.toString(), { name: o.name, email: o.email }]));

    const queryTime = Date.now() - queryStart;
    console.log(`[API /admin/companies] Fetched ${companies.length} companies in ${queryTime}ms`);

    const companiesWithData = companies.map((company: any) => ({
      id: company._id.toString(),
      name: company.name,
      description: company.description,
      address: company.address,
      coordinates: company.coordinates,
      website: company.website,
      socialMedia: company.socialMedia,
      featured: company.featured === true, // Explicitly check for true, default to false
      owner: company.owner ? ownerMap.get(company.owner.toString()) || { name: 'Unknown', email: 'unknown@example.com' } : null,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    const totalTime = Date.now() - startTime;
    console.log(`[API /admin/companies] Total time: ${totalTime}ms`);

    return NextResponse.json({ companies: companiesWithData }, { status: 200 });
  } catch (error: any) {
    console.error('[API /admin/companies] Error:', error);
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

