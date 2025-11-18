'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { adminApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  jobs?: any[];
  cv?: any;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  location?: string;
  website?: string;
  owner: any;
  createdAt: string;
  updatedAt: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  recruiter: any;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [resettingPassword, setResettingPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [editForm, setEditForm] = useState({
    email: '',
    name: '',
    role: '',
    password: '',
  });
  const [companyEditForm, setCompanyEditForm] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
  });
  const [jobEditForm, setJobEditForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: 'full-time',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'admin') {
      router.push(`/${user.role === 'recruiter' ? 'recruiter' : 'job-seeker'}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadUsers();
      loadCompanies();
      loadJobs();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await adminApi.getCompanies();
      setCompanies(data.companies);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    }
  };

  const loadJobs = async () => {
    try {
      const data = await adminApi.getJobs();
      setJobs(data.jobs);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    }
  };

  const handleEdit = (userData: User) => {
    setEditingUser(userData);
    setEditForm({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      password: '',
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const updateData: any = {
        email: editForm.email,
        name: editForm.name,
        role: editForm.role,
      };
      if (editForm.password) {
        updateData.password = editForm.password;
      }
      await adminApi.updateUser(editingUser.id, updateData);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their associated data.')) return;

    try {
      await adminApi.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      loadCompanies(); // Reload companies in case a recruiter's company was affected
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyEditForm({
      name: company.name,
      description: company.description || '',
      location: company.location || '',
      website: company.website || '',
    });
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    try {
      await adminApi.updateCompany(editingCompany.id, companyEditForm);
      setEditingCompany(null);
      loadCompanies();
    } catch (err: any) {
      alert(err.message || 'Failed to update company');
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? This will also delete all associated jobs.')) return;

    try {
      await adminApi.deleteCompany(companyId);
      setCompanies(companies.filter((c) => c.id !== companyId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete company');
    }
  };

  const handleResetPassword = (userData: User) => {
    setResettingPassword(userData);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleConfirmResetPassword = async () => {
    if (!resettingPassword) return;

    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await adminApi.updateUser(resettingPassword.id, { password: newPassword });
      setResettingPassword(null);
      setNewPassword('');
      setConfirmNewPassword('');
      alert('Password reset successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setJobEditForm({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary || '',
      type: job.type,
    });
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      await adminApi.updateJob(editingJob.id, jobEditForm);
      setEditingJob(null);
      loadJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await adminApi.deleteJob(jobId);
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recruiter">Recruiter</option>
                    <option value="job-seeker">Job Seeker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {resettingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Reset Password for {resettingPassword.name}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirmResetPassword}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-semibold"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      setResettingPassword(null);
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mb-6">Users</h2>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userData) => (
                  <tr key={userData.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {userData.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {userData.role === 'recruiter' && (
                        <span>{userData.jobs?.length || 0} job(s)</span>
                      )}
                      {userData.role === 'job-seeker' && (
                        <span>{userData.cv ? 'Has CV' : 'No CV'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(userData)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(userData)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDelete(userData.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No users found.</p>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Companies</h2>

        {editingCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Edit Company</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyEditForm.name}
                    onChange={(e) => setCompanyEditForm({ ...companyEditForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={companyEditForm.description}
                    onChange={(e) => setCompanyEditForm({ ...companyEditForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={companyEditForm.location}
                    onChange={(e) => setCompanyEditForm({ ...companyEditForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={companyEditForm.website}
                    onChange={(e) => setCompanyEditForm({ ...companyEditForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdateCompany}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditingCompany(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof company.owner === 'object' && company.owner ? (
                        <span>{company.owner.name} ({company.owner.email})</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {company.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {companies.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-4">
            <p className="text-gray-600">No companies found.</p>
          </div>
        )}

        {editingJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Job</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={jobEditForm.title}
                    onChange={(e) => setJobEditForm({ ...jobEditForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={jobEditForm.company}
                    onChange={(e) => setJobEditForm({ ...jobEditForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={jobEditForm.location}
                    onChange={(e) => setJobEditForm({ ...jobEditForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                  <select
                    value={jobEditForm.type}
                    onChange={(e) => setJobEditForm({ ...jobEditForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    value={jobEditForm.salary}
                    onChange={(e) => setJobEditForm({ ...jobEditForm, salary: e.target.value })}
                    placeholder="e.g., $50,000 - $70,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={jobEditForm.description}
                    onChange={(e) => setJobEditForm({ ...jobEditForm, description: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdateJob}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditingJob(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Jobs</h2>

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
                    Recruiter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {job.title}
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
                      {typeof job.recruiter === 'object' && job.recruiter ? (
                        <span>{job.recruiter.name} ({job.recruiter.email})</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditJob(job)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {jobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-4">
            <p className="text-gray-600">No jobs found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

