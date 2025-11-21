'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { jobsApi } from '@/lib/api';
import { getCountryNameFromCode } from '@/lib/countryUtils';
import Link from 'next/link';

interface CompanyInfo {
  id?: string;
  name?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

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
  qualifications?: string[];
  pictures?: string[];
  recruiter: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
  companyId?: CompanyInfo;
}

// Component to handle date formatting (prevents hydration mismatch)
function FormattedDate({ date }: { date: string }) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFormattedDate(
      new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, [date]);

  if (!mounted) {
    return <p className="text-sm text-gray-500 mt-1">Posted: Loading...</p>;
  }

  return <p className="text-sm text-gray-500 mt-1">Posted: {formattedDate}</p>;
}

function formatCompanyAddress(address?: CompanyInfo['address']): string | null {
  if (!address) return null;
  const parts: string[] = [];
  if (address.street) parts.push(address.street);
  const cityState = [address.city, address.state].filter(Boolean).join(', ');
  if (cityState) parts.push(cityState);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) {
    parts.push(getCountryNameFromCode(address.country));
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

const SOCIAL_ICONS: Record<string, React.ReactElement> = {
  facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M13.5 9.5h2.31l.35-2.35h-2.66V5.26c0-.68.19-1.15 1.18-1.15h1.49V2.08c-.26-.03-1.15-.11-2.18-.11-2.16 0-3.64 1.32-3.64 3.75v2.28H8.5v2.35h2.3v7h2.7v-7z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10zm-5 2.5c-2.49 0-4.5 2.01-4.5 4.5S9.51 16.5 12 16.5 16.5 14.49 16.5 12 14.49 7.5 12 7.5zm0 2c1.38 0 2.5 1.12 2.5 2.5S13.38 14.5 12 14.5 9.5 13.38 9.5 12 10.62 9.5 12 9.5zM17.5 6.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M17.25 4.5h-1.04c-.2 0-.36.16-.36.36s.16.36.36.36h.54v3.33c0 1.71-.86 2.5-2.46 2.5-1.43 0-2.34-.88-2.34-2.58V6.42c0-.2-.16-.36-.36-.36s-.36.16-.36.36v5.56c0 2.92 1.76 4.56 4.47 4.56 2.22 0 3.84-1.08 4.41-3.22h1.13v-4.74c0-.2-.16-.36-.36-.36s-.36.16-.36.36v.59c-.66-.28-1.26-.46-1.92-.54V4.86c0-.2-.16-.36-.36-.36z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M19.63 4.36a3.01 3.01 0 0 0-2.12-2.12C15.61 1.5 12 1.5 12 1.5s-3.61 0-5.51.74a3.01 3.01 0 0 0-2.12 2.12C3.5 6.24 3.5 12 3.5 12s0 5.76.87 7.64a3.01 3.01 0 0 0 2.12 2.12c1.9.74 5.51.74 5.51.74s3.61 0 5.51-.74a3.01 3.01 0 0 0 2.12-2.12c.87-1.88.87-7.64.87-7.64s0-5.76-.87-7.64zM10 15.5v-7l6 3.5-6 3.5z"/>
    </svg>
  ),
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    // Load job regardless of authentication status
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      const data = await jobsApi.getOne(jobId);
      setJob(data.job);
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
            <Link href="/jobs" className="text-blue-600 hover:underline font-semibold">
              Return to Jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/jobs"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          ← Back to Jobs
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Job Pictures */}
          {job.pictures && job.pictures.length > 0 && (
            <div className="w-full">
              <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                <img
                  src={job.pictures[0]}
                  alt={`${job.title} - Featured`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Job Title and Company */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-2xl text-gray-600 mb-4">{job.company}</p>
            </div>

            {/* Job Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>{job.location}</span>
                </div>
                {job.country && typeof job.country === 'string' && job.country.trim() && (
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">🌍</span>
                    <span>{getCountryNameFromCode(job.country)}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">💼</span>
                  <span className="capitalize">{job.type.replace('-', ' ')}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center text-gray-700 font-semibold">
                    <span className="mr-2">💰</span>
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>
              
              {/* Languages Required - in Job Details section */}
              {job.languages && job.languages.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">🌐</span>
                    <span className="font-medium">Languages Required:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Required Qualifications - in Job Details section */}
              {job.qualifications && job.qualifications.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📜</span>
                    <span className="font-medium">Required Qualifications:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.qualifications.map((qualification, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {qualification}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>

            {job.pictures && job.pictures.length > 0 && (
            <div className="mb-6">
                <div className="grid grid-cols-3 gap-2">
                  {job.pictures.map((picture, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setLightboxIndex(index);
                        setIsLightboxOpen(true);
                      }}
                      className="w-full h-32 overflow-hidden rounded-lg border border-gray-300 p-0"
                      type="button"
                    >
                      <img
                        src={picture}
                        alt={`${job.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLightboxOpen && job?.pictures && job.pictures.length > 0 && (
              <div
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={() => setIsLightboxOpen(false)}
              >
                <div
                  className="relative max-w-3xl w-full mx-auto"
                  onClick={(event) => event.stopPropagation()}
                >
                  <img
                    src={job.pictures[lightboxIndex]}
                    alt={`${job.title} - Image ${lightboxIndex + 1}`}
                    className="w-full h-[70vh] object-contain bg-black"
                  />
                  {job.pictures && job.pictures.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxIndex((prev) =>
                            prev === 0 ? (job.pictures?.length ?? 1) - 1 : prev - 1
                          )
                        }
                        className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/80 text-gray-900 rounded-full p-2"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxIndex((prev) =>
                            prev === (job.pictures?.length ?? 1) - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/80 text-gray-900 rounded-full p-2"
                      >
                        ›
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute top-2 right-2 bg-white/80 text-gray-900 rounded-full p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {job.companyId && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Company Info</h2>
                {job.companyId.description && (
                  <p className="text-gray-700 mb-2">{job.companyId.description}</p>
                )}
                {formatCompanyAddress(job.companyId.address) && (
                  <p className="text-sm text-gray-600 mb-1">
                    Location: {formatCompanyAddress(job.companyId.address)}
                  </p>
                )}
                {job.companyId.website && (
                  <p className="text-sm text-gray-600 mb-1">
                    Website:{' '}
                    <a
                      href={job.companyId.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {job.companyId.website}
                    </a>
                  </p>
                )}
                {(() => {
                  const socialEntries = job.companyId.socialMedia
                    ? Object.entries(job.companyId.socialMedia).filter(([, value]) => Boolean(value))
                    : [];
                  if (socialEntries.length === 0) {
                    return null;
                  }
                  const companyNameText =
                    job.companyId.name && job.companyId.name.trim()
                      ? `${job.companyId.name.trim()}`
                      : 'us';
                  return (
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-blue-600">
                      <span className="font-semibold text-gray-600">
                        Follow {companyNameText} on:
                      </span>
                      {socialEntries.map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          <span aria-hidden="true">{SOCIAL_ICONS[platform] || '🌐'}</span>
                          <span className="text-blue-600">
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </span>
                        </a>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Posted Info */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Posted by: <span className="font-semibold">{job.recruiter.name}</span> ({job.recruiter.email})
              </p>
              <FormattedDate date={job.createdAt} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


