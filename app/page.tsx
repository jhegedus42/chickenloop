'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';
import { jobsApi } from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  recruiter: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'job-seeker') {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await jobsApi.getAll();
      setJobs(data.jobs || []);
    } catch (err) {
      // Silently fail - not critical for home page
    } finally {
      setJobsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user && user.role === 'job-seeker' ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {user.name}!
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Browse available watersports job opportunities
              </p>
              <Link
                href="/jobs"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                View All Jobs
              </Link>
            </div>

            {jobsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Jobs</h2>
                <div className="grid gap-6 mb-8">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-lg text-gray-600 mb-2">{job.company}</p>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <span className="text-gray-600">📍 {job.location}</span>
                        <span className="text-gray-600">💼 {job.type}</span>
                        {job.salary && (
                          <span className="text-gray-700 font-semibold">💰 {job.salary}</span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                      <Link
                        href="/jobs"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        View all jobs →
                      </Link>
                    </div>
                  ))}
                </div>
                {jobs.length > 3 && (
                  <div className="text-center">
                    <Link
                      href="/jobs"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold inline-block"
                    >
                      View All {jobs.length} Jobs
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">No jobs available at the moment.</p>
                <p className="text-gray-500">Check back later for new opportunities!</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Welcome to ChickenLoop
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Your gateway to watersports careers
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">For Job Seekers</h2>
                <p className="text-gray-600 mb-4">
                  Create your CV and browse watersports job opportunities
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Create and manage your CV</li>
                  <li>Browse all available jobs</li>
                  <li>Find your dream watersports career</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">For Recruiters</h2>
                <p className="text-gray-600 mb-4">
                  Post job openings and find the perfect candidates
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Post job listings</li>
                  <li>Manage your job postings</li>
                  <li>Reach qualified candidates</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">Watersports Focus</h2>
                <p className="text-gray-600 mb-4">
                  Specialized platform for watersports industry
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Kitesurfing instructors</li>
                  <li>Windsurfing coaches</li>
                  <li>Water sports equipment specialists</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
