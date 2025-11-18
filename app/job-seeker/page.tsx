'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { jobsApi, cvApi } from '@/lib/api';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  pictures?: string[];
  recruiter: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function JobSeekerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'job-seeker') {
      router.push(`/${user.role === 'admin' ? 'admin' : 'recruiter'}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'job-seeker') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [jobsData, cvData] = await Promise.all([
        jobsApi.getAll().catch(() => ({ jobs: [] })),
        cvApi.get().catch(() => null),
      ]);
      setJobs(jobsData.jobs || []);
      setCv(cvData?.cv || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async () => {
    if (!confirm('Are you sure you want to delete your CV?')) return;

    try {
      await cvApi.delete();
      setCv(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete CV');
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Seeker Dashboard</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">My CV</h2>
            {cv ? (
              <div>
                <p className="text-gray-600 mb-4">
                  You have a CV. You can edit or delete it.
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/job-seeker/cv/edit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit CV
                  </Link>
                  <button
                    onClick={handleDeleteCV}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete CV
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">You don't have a CV yet.</p>
                <Link
                  href="/job-seeker/cv/new"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold inline-block"
                >
                  Create CV
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Jobs</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No jobs available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-lg text-gray-600 mb-2">{job.company}</p>
                  <p className="text-gray-600 mb-2">{job.location}</p>
                  <p className="text-sm text-gray-500 mb-2">{job.type}</p>
                  {job.salary && (
                    <p className="text-gray-700 font-semibold mb-4">Salary: {job.salary}</p>
                  )}
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  {job.pictures && job.pictures.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-3 gap-2">
                        {job.pictures.map((picture, index) => (
                          <img
                            key={index}
                            src={picture}
                            alt={`${job.title} - Image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mb-2">
                    Posted by: {job.recruiter.name} ({job.recruiter.email})
                  </p>
                  <p className="text-sm text-gray-400">
                    Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

