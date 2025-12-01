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
  const [togglingPublish, setTogglingPublish] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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

  const handleTogglePublish = async () => {
    setTogglingPublish(true);
    try {
      const response = await cvApi.togglePublish();
      // Reload CV to get updated published status
      const cvData = await cvApi.get().catch(() => null);
      if (cvData?.cv) {
        setCv(cvData.cv);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle CV visibility');
    } finally {
      setTogglingPublish(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage(data.message || 'Thank you for your feedback!');
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => {
          setShowContactModal(false);
          setSubmitMessage('');
        }, 2000);
      } else {
        // If email service is not configured, show fallback message
        if (data.fallback) {
          setSubmitMessage('Email service is not configured. Please contact us directly at hello@chickenloop.com');
        } else {
          setSubmitMessage(data.error || 'Failed to send message. Please try again.');
        }
      }
    } catch (err: any) {
      setSubmitMessage('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
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
                  You have created a CV.<br />
                  Your CV is only visible to registered recruiters.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <Link
                    href="/job-seeker/cv/view"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    View CV
                  </Link>
                  <Link
                    href="/job-seeker/cv/edit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit CV
                  </Link>
                  <button
                    onClick={handleTogglePublish}
                    disabled={togglingPublish}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                      cv.published === false
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {togglingPublish ? 'Updating...' : (cv.published === false ? 'Show CV' : 'Hide CV')}
                  </button>
                  <button
                    onClick={handleDeleteCV}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete CV
                  </button>
                </div>
                {cv.published === false && (
                  <p className="text-sm text-orange-600 mt-2">
                    Your CV is currently hidden, nobody except from you can see it.
                  </p>
                )}
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

        {/* My Account Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">My Account</h2>
            <p className="text-gray-600 mb-4">
              Manage your account settings and preferences.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/job-seeker/account/edit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Account
              </Link>
              <Link
                href="/job-seeker/account/change-password"
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Change Password
              </Link>
              <Link
                href="/job-seeker/account/delete"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Account
              </Link>
            </div>
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

        {/* Feedback Section - Bottom Right */}
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-gray-200 z-50">
          <p className="text-sm text-gray-700 mb-3">
            Do you have Feedback or Feature Requests?<br />
            We love to hear from you!
          </p>
          <button
            onClick={() => {
              setContactForm({ 
                name: user?.name || '', 
                email: user?.email || '', 
                message: '' 
              });
              setShowContactModal(true);
            }}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm text-center w-full"
          >
            Send Mail to Site Admin
          </button>
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setShowContactModal(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Us</h2>
              <form onSubmit={handleContactSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Tell us your feedback or feature request..."
                  />
                </div>
                {submitMessage && (
                  <div className={`mb-4 p-3 rounded-md ${
                    submitMessage.includes('Thank you') 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    disabled={submitting}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

