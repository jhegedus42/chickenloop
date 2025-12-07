'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function JobsListRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /jobs with the same query parameters
    const keyword = searchParams?.get('keyword') || '';
    const location = searchParams?.get('location') || '';
    const category = searchParams?.get('category') || '';

    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    if (category) params.set('category', category);

    const queryString = params.toString();
    router.replace(`/jobs${queryString ? `?${queryString}` : ''}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to jobs...</p>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function JobsListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <JobsListRedirect />
    </Suspense>
  );
}
