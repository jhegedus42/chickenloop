'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CV {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  summary?: string;
  experienceAndSkill?: string[];
  languages?: string[];
  lookingForWorkInAreas?: string[];
  professionalCertifications?: string[];
  pictures?: string[];
  jobSeeker: {
    _id: string;
    name: string;
    email: string;
    lastOnline?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Helper function to format time ago
function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

// Component to handle time ago display (prevents hydration mismatch)
function TimeAgoDisplay({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeAgo(getTimeAgo(date));
    
    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(date));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <span className="text-xs text-gray-500">Loading...</span>;
  }

  return <span className="text-xs text-gray-500">{timeAgo}</span>;
}

export default function CVsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'recruiter' && user.role !== 'admin') {
      router.push(`/${user.role === 'job-seeker' ? 'job-seeker' : ''}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'recruiter' || user.role === 'admin')) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
    try {
      const response = await fetch('/api/cvs', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to load CVs');
      }
      
      const data = await response.json();
      setCvs(data.cvs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load CVs');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Job Candidates</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {cvs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No CVs available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later for new candidates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cvs.map((cv) => {
              // Get the first picture, or use a placeholder
              const firstPicture = cv.pictures && cv.pictures.length > 0 
                ? cv.pictures[0] 
                : null;
              
              // Get user's last online date
              const lastOnlineDate = cv.jobSeeker?.lastOnline;

              return (
                <Link
                  key={cv._id}
                  href={`/cvs/${cv._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                >
                  {/* CV Picture */}
                  <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                    {firstPicture ? (
                      <img
                        src={firstPicture}
                        alt={cv.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* CV Info */}
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {cv.fullName}
                    </h2>

                    {/* Summary Preview */}
                    {cv.summary && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {cv.summary}
                      </p>
                    )}

                    {/* Skills Preview */}
                    {cv.experienceAndSkill && cv.experienceAndSkill.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {cv.experienceAndSkill.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {cv.experienceAndSkill.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{cv.experienceAndSkill.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Work Areas Preview */}
                    {cv.lookingForWorkInAreas && cv.lookingForWorkInAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {cv.lookingForWorkInAreas.slice(0, 2).map((area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                          >
                            {area}
                          </span>
                        ))}
                        {cv.lookingForWorkInAreas.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{cv.lookingForWorkInAreas.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Languages Preview */}
                    {cv.languages && cv.languages.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {cv.languages.slice(0, 2).map((lang, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                        {cv.languages.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            +{cv.languages.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Location and Last Online */}
                    <div className="flex flex-col gap-1 mt-2">
                      {cv.address && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span>📍</span>
                          <span className="font-medium text-gray-800">{cv.address}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Last logged in:</span>
                        {lastOnlineDate ? (
                          <TimeAgoDisplay date={lastOnlineDate} />
                        ) : (
                          <span className="text-xs text-gray-500">Never</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

