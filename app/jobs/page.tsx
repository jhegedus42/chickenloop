'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { jobsApi } from '@/lib/api';
import { getCountryNameFromCode } from '@/lib/countryUtils';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  country?: string;
  salary?: string;
  type: string;
  languages?: string[];
  occupationalAreas?: string[];
  sports?: string[];
  pictures?: string[];
  recruiter: {
    name: string;
    email: string;
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Store all jobs for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  useEffect(() => {
    // Load jobs regardless of authentication status
    loadJobs();
  }, []);

  useEffect(() => {
    // Filter jobs when any filter changes
    let filtered = allJobs;

    // Filter by country
    if (selectedCountry) {
      filtered = filtered.filter((job) => {
        if (!job.country) return false;
        return job.country.toUpperCase() === selectedCountry.toUpperCase();
      });
    }

    // Filter by job category
    if (selectedCategory) {
      filtered = filtered.filter((job) => {
        if (!job.occupationalAreas || job.occupationalAreas.length === 0) return false;
        return job.occupationalAreas.includes(selectedCategory);
      });
    }

    // Filter by sport/activity
    if (selectedSport) {
      filtered = filtered.filter((job) => {
        if (!job.sports || job.sports.length === 0) return false;
        return job.sports.includes(selectedSport);
      });
    }

    // Filter by language
    if (selectedLanguage) {
      filtered = filtered.filter((job) => {
        if (!job.languages || job.languages.length === 0) return false;
        return job.languages.includes(selectedLanguage);
      });
    }

    setJobs(filtered);
  }, [selectedCountry, selectedCategory, selectedSport, selectedLanguage, allJobs]);

  const loadJobs = async () => {
    try {
      const data = await jobsApi.getAll();
      const jobsList = data.jobs || [];
      setAllJobs(jobsList);
      setJobs(jobsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Get unique countries from all jobs
  const getUniqueCountries = (): Array<{ code: string; name: string }> => {
    const countryMap = new Map<string, string>();
    
    allJobs.forEach((job) => {
      if (job.country && job.country.trim()) {
        const code = job.country.toUpperCase();
        if (!countryMap.has(code)) {
          countryMap.set(code, getCountryNameFromCode(code));
        }
      }
    });

    // Convert to array and sort by country name
    const countries = Array.from(countryMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  };

  // Get unique job categories from all jobs
  const getUniqueCategories = (): string[] => {
    const categorySet = new Set<string>();
    
    allJobs.forEach((job) => {
      if (job.occupationalAreas && job.occupationalAreas.length > 0) {
        job.occupationalAreas.forEach((category) => {
          categorySet.add(category);
        });
      }
    });

    // Convert to array and sort alphabetically
    return Array.from(categorySet).sort();
  };

  // Get unique sports/activities from all jobs
  const getUniqueSports = (): string[] => {
    const sportSet = new Set<string>();
    
    allJobs.forEach((job) => {
      if (job.sports && job.sports.length > 0) {
        job.sports.forEach((sport) => {
          sportSet.add(sport);
        });
      }
    });

    // Convert to array and sort alphabetically
    return Array.from(sportSet).sort();
  };

  // Get unique languages from all jobs
  const getUniqueLanguages = (): string[] => {
    const languageSet = new Set<string>();
    
    allJobs.forEach((job) => {
      if (job.languages && job.languages.length > 0) {
        job.languages.forEach((language) => {
          languageSet.add(language);
        });
      }
    });

    // Convert to array and sort alphabetically
    return Array.from(languageSet).sort();
  };

  if (loading) {
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
        <div className="flex flex-col mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-900">Available Jobs</h1>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center sm:justify-end gap-3 flex-wrap">
            {/* Country Filter */}
            <div className="flex items-center gap-3">
              <label htmlFor="country-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Country:
              </label>
              <select
                id="country-filter"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
              >
                <option value="">All Countries</option>
                {getUniqueCountries().map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Category Filter */}
            <div className="flex items-center gap-3">
              <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Job Category:
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sport Filter */}
            <div className="flex items-center gap-3">
              <label htmlFor="sport-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sport:
              </label>
              <select
                id="sport-filter"
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
              >
                <option value="">All Sports</option>
                {getUniqueSports().map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Languages Filter */}
            <div className="flex items-center gap-3">
              <label htmlFor="language-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Language:
              </label>
              <select
                id="language-filter"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white min-w-[200px]"
              >
                <option value="">All Languages</option>
                {getUniqueLanguages().map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedCountry || selectedCategory || selectedSport || selectedLanguage) && (
              <button
                onClick={() => {
                  setSelectedCountry('');
                  setSelectedCategory('');
                  setSelectedSport('');
                  setSelectedLanguage('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {(selectedCountry || selectedCategory || selectedSport || selectedLanguage) && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            Showing jobs
            {selectedCountry && (
              <span> in: <strong>{getCountryNameFromCode(selectedCountry)}</strong></span>
            )}
            {selectedCategory && (
              <span>
                {selectedCountry ? ',' : ''} category: <strong>{selectedCategory}</strong>
              </span>
            )}
            {selectedSport && (
              <span>
                {(selectedCountry || selectedCategory) ? ',' : ''} sport: <strong>{selectedSport}</strong>
              </span>
            )}
            {selectedLanguage && (
              <span>
                {(selectedCountry || selectedCategory || selectedSport) ? ',' : ''} language: <strong>{selectedLanguage}</strong>
              </span>
            )}
            {' '}({jobs.length} {jobs.length === 1 ? 'job' : 'jobs'})
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No jobs available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobs.map((job) => {
              // Get the most recent date (createdAt or updatedAt if it exists and is more recent)
              const mostRecentDate = (job.updatedAt && new Date(job.updatedAt) > new Date(job.createdAt))
                ? job.updatedAt
                : job.createdAt;
              
              // Get the first picture, or use a placeholder
              const firstPicture = job.pictures && job.pictures.length > 0 
                ? job.pictures[0] 
                : null;

              return (
                <Link
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                >
                  {/* Job Picture */}
                  <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                    {firstPicture ? (
                      <img
                        src={firstPicture}
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Job Title */}
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {job.title}
                    </h2>

                    {/* Location and Time Ago */}
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-600 flex flex-wrap items-center gap-1">
                        <span className="mr-1">📍</span>
                        <span className="font-medium text-gray-800">{job.location}</span>
                        {job.country && typeof job.country === 'string' && job.country.trim() && (
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            • {getCountryNameFromCode(job.country)}
                          </span>
                        )}
                      </p>
                      <TimeAgoDisplay date={mostRecentDate} />
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

