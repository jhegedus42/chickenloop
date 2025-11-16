'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
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

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      const data = await jobsApi.getAll();
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Available Jobs</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No jobs available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later for new opportunities!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                    <p className="text-lg text-gray-600 mb-2">{job.company}</p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <span className="text-gray-600">📍 {job.location}</span>
                      <span className="text-gray-600">💼 {job.type}</span>
                      {job.salary && (
                        <span className="text-gray-700 font-semibold">💰 {job.salary}</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{job.description}</p>
                    <div className="text-sm text-gray-500">
                      <p>Posted by: {job.recruiter.name} ({job.recruiter.email})</p>
                      <p>Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

