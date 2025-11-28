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
  recruiter: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function JobSeekerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favouriteJobs, setFavouriteJobs] = useState<Job[]>([]);
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
      const [favouritesData, cvData] = await Promise.all([
        jobsApi.getFavourites().catch(() => ({ jobs: [] })),
        cvApi.get().catch(() => null),
      ]);
      setFavouriteJobs(favouritesData.jobs || []);
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

  const handleRemoveFavourite = async (jobId: string) => {
    if (!confirm('Remove this job from your favourites?')) return;

    try {
      await jobsApi.toggleFavourite(jobId);
      // Reload favourites to update the list
      const favouritesData = await jobsApi.getFavourites().catch(() => ({ jobs: [] }));
      setFavouriteJobs(favouritesData.jobs || []);
    } catch (err: any) {
      alert(err.message || 'Failed to remove from favourites');
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

        {/* Favourite Jobs Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">My Favourite Jobs</h2>
          {favouriteJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">You haven't added any jobs to your favourites yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Click "Add to Favourites" on any job listing to save it here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {favouriteJobs.map((job) => (
                      <tr key={job._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            href={`/jobs/${job._id}`}
                            className="text-blue-600 hover:text-blue-900 hover:underline"
                          >
                            {job.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {job.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.salary || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRemoveFavourite(job._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

