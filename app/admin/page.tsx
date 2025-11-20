'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { adminApi } from '@/lib/api';
import { OFFICIAL_LANGUAGES } from '@/lib/languages';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const DraggableMap = dynamic(
  () => import('../components/DraggableMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg">
        <span className="text-gray-500">Loading map...</span>
      </div>
    )
  }
);

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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
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
  country?: string;
  salary?: string;
  type: string;
  languages?: string[];
  pictures?: string[];
  recruiter: any;
  createdAt: string;
  updatedAt: string;
}

// Component to display coordinates (prevents hydration mismatch)
function CoordinatesDisplay({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="mt-2 text-sm text-gray-600">Coordinates: Loading...</p>;
  }

  return (
    <p className="mt-2 text-sm text-gray-600">
      Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
    </p>
  );
}

// Component wrapper for location search (prevents hydration mismatch)
function LocationSearchSection({
  searchQuery,
  setSearchQuery,
  searchResults,
  showResults,
  setShowResults,
  searching,
  searchContainerRef,
  onLocationSelect,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchResults: any[];
  showResults: boolean;
  setShowResults: (value: boolean) => void;
  searching: boolean;
  searchContainerRef: React.RefObject<HTMLDivElement>;
  onLocationSelect: (result: any) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search for your location *
        </label>
        <p className="text-xs text-gray-600 mb-2">
          Search for your location by entering your company name. (If we can not find your company, enter a location nearby. A map will pop up on which you can move the Pin to the correct location)
        </p>
        <input
          type="text"
          value=""
          disabled
          placeholder="e.g., Tarifa Windsurf Center, Tarifa, Spain"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
        />
      </div>
    );
  }

  return (
    <div className="mb-4 relative" ref={searchContainerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search for your location *
      </label>
      <p className="text-xs text-gray-600 mb-2">
        Search for your location by entering your company name. (If we can not find your company, enter a location nearby. A map will pop up on which you can move the Pin to the correct location)
      </p>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchResults.length > 0 && setShowResults(true)}
        placeholder="e.g., Tarifa Windsurf Center, Tarifa, Spain"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
      />
      {searching && (
        <div className="absolute right-3 top-20 text-gray-500 text-sm">
          Searching...
        </div>
      )}
      
      {/* Dropdown with search results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onLocationSelect(result)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
            >
              <div className="font-medium text-gray-900">{result.displayName}</div>
              {(result.address.city || result.address.country) && (
                <div className="text-xs text-gray-500 mt-1">
                  {[result.address.city, result.address.country].filter(Boolean).join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'companies' | 'jobs'>('users');
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
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    coordinates: null as { latitude: number; longitude: number } | null,
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      tiktok: '',
      youtube: '',
    },
  });
  const [geocodingCompany, setGeocodingCompany] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [companySearchResults, setCompanySearchResults] = useState<any[]>([]);
  const [showCompanySearchResults, setShowCompanySearchResults] = useState(false);
  const [searchingCompany, setSearchingCompany] = useState(false);
  const [companyMapMounted, setCompanyMapMounted] = useState(false);
  const [showCompanyLocationModal, setShowCompanyLocationModal] = useState(false);
  const companySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const companySearchContainerRef = useRef<HTMLDivElement>(null);
  const [jobEditForm, setJobEditForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    country: '',
    salary: '',
    type: 'full-time',
    languages: [] as string[],
    pictures: [] as string[],
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

  // Handle clicks outside company search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companySearchContainerRef.current && !companySearchContainerRef.current.contains(event.target as Node)) {
        setShowCompanySearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for locations when company query changes
  useEffect(() => {
    if (companySearchTimeoutRef.current) {
      clearTimeout(companySearchTimeoutRef.current);
    }

    if (companySearchQuery.trim().length < 3) {
      setCompanySearchResults([]);
      setShowCompanySearchResults(false);
      return;
    }

    companySearchTimeoutRef.current = setTimeout(async () => {
      setSearchingCompany(true);
      try {
        const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(companySearchQuery)}`);
        const data = await response.json();

        if (response.ok && data.results) {
          setCompanySearchResults(data.results);
          setShowCompanySearchResults(true);
        }
      } catch (err) {
        // Silently handle errors
      } finally {
        setSearchingCompany(false);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (companySearchTimeoutRef.current) {
        clearTimeout(companySearchTimeoutRef.current);
      }
    };
  }, [companySearchQuery]);

  // Mount map when company coordinates are set
  useEffect(() => {
    if (companyEditForm.coordinates) {
      setCompanyMapMounted(true);
    }
  }, [companyEditForm.coordinates]);

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
    const existingAddress = (company as any).address || {};
    const existingSocialMedia = (company as any).socialMedia || {};
    const existingCoordinates = (company as any).coordinates || null;
    
    setCompanyEditForm({
      name: company.name,
      description: company.description || '',
      address: {
        street: existingAddress.street || '',
        city: existingAddress.city || '',
        state: existingAddress.state || '',
        postalCode: existingAddress.postalCode || '',
        country: existingAddress.country || '',
      },
      coordinates: existingCoordinates,
      website: company.website || '',
      socialMedia: {
        facebook: existingSocialMedia.facebook || '',
        instagram: existingSocialMedia.instagram || '',
        tiktok: existingSocialMedia.tiktok || '',
        youtube: existingSocialMedia.youtube || '',
      },
    });
    
    // Initialize search query and map mount state
    setCompanySearchQuery('');
    setCompanyMapMounted(!!existingCoordinates);
  };

  // Update search query when company is being edited (prevents hydration mismatch)
  useEffect(() => {
    if (editingCompany) {
      const existingAddress = (editingCompany as any).address || {};
      const existingCoordinates = (editingCompany as any).coordinates || null;
      
      if (existingCoordinates) {
        const addressParts = [];
        if (existingAddress.street) addressParts.push(existingAddress.street);
        if (existingAddress.city) addressParts.push(existingAddress.city);
        if (existingAddress.state) addressParts.push(existingAddress.state);
        if (existingAddress.postalCode) addressParts.push(existingAddress.postalCode);
        if (existingAddress.country) addressParts.push(existingAddress.country);
        const searchQuery = addressParts.join(', ') || editingCompany.name;
        setCompanySearchQuery(searchQuery);
      }
    } else {
      setCompanySearchQuery('');
    }
  }, [editingCompany]);

  const handleCompanyLocationSelect = (result: any) => {
    setCompanyEditForm({
      ...companyEditForm,
      address: {
        street: result.address.street || '',
        city: result.address.city || '',
        state: result.address.state || '',
        postalCode: result.address.postalCode || '',
        country: result.address.country || '',
      },
      coordinates: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
    });
    setCompanySearchQuery(result.displayName);
    setShowCompanySearchResults(false);
    setCompanyMapMounted(true);
  };

  const handleCompanyLocationChange = (lat: number, lng: number) => {
    setCompanyEditForm({
      ...companyEditForm,
      coordinates: {
        latitude: lat,
        longitude: lng,
      },
    });
  };

  const handleGeocodeCompany = async () => {
    setGeocodingCompany(true);
    setError('');

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: companyEditForm.address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to geocode address');
      }

      // Update form with coordinates
      setCompanyEditForm({
        ...companyEditForm,
        coordinates: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to geocode address');
    } finally {
      setGeocodingCompany(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    // Validate that coordinates are set
    if (!companyEditForm.coordinates || !companyEditForm.coordinates.latitude || !companyEditForm.coordinates.longitude) {
      setShowCompanyLocationModal(true);
      return;
    }

    setError('');
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
      country: job.country || '',
      salary: job.salary || '',
      type: job.type,
      languages: job.languages || [],
      pictures: job.pictures || [],
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'companies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Jobs
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
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
          </>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <>
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
                      <Link 
                        href={`/companies/${company.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof company.owner === 'object' && company.owner ? (
                        <span>{company.owner.name} ({company.owner.email})</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.address 
                        ? `${company.address.city || ''}${company.address.city && company.address.state ? ', ' : ''}${company.address.state || ''}${company.address.postalCode ? ` ${company.address.postalCode}` : ''}`.trim() || company.address.street || '-'
                        : '-'}
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
          </>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      value={jobEditForm.country}
                      onChange={(e) => setJobEditForm({ ...jobEditForm, country: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages Required (Optional - up to 3)
                  </label>
                  
                  {/* Selected Languages Display */}
                  {jobEditForm.languages.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {jobEditForm.languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => {
                              setJobEditForm({
                                ...jobEditForm,
                                languages: jobEditForm.languages.filter((l) => l !== lang),
                              });
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            aria-label={`Remove ${lang}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Languages Checkbox List */}
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                    {OFFICIAL_LANGUAGES.map((lang) => {
                      const isSelected = jobEditForm.languages.includes(lang);
                      const isDisabled = !isSelected && jobEditForm.languages.length >= 3;
                      
                      return (
                        <label
                          key={lang}
                          className={`flex items-center py-2 px-2 rounded hover:bg-gray-50 cursor-pointer ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (jobEditForm.languages.length < 3) {
                                  setJobEditForm({
                                    ...jobEditForm,
                                    languages: [...jobEditForm.languages, lang],
                                  });
                                }
                              } else {
                                setJobEditForm({
                                  ...jobEditForm,
                                  languages: jobEditForm.languages.filter((l) => l !== lang),
                                });
                              }
                            }}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900">{lang}</span>
                        </label>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {jobEditForm.languages.length > 0 
                      ? `${jobEditForm.languages.length} of 3 languages selected`
                      : 'Select up to 3 languages (tap to select)'}
                  </p>
                </div>
                {jobEditForm.pictures && jobEditForm.pictures.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pictures</label>
                    <div className="grid grid-cols-3 gap-2">
                      {jobEditForm.pictures.map((picture, index) => (
                        <div key={index} className="relative">
                          <img
                            src={picture}
                            alt={`Job Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPictures = jobEditForm.pictures.filter((_, i) => i !== index);
                              setJobEditForm({ ...jobEditForm, pictures: newPictures });
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-75 hover:opacity-100"
                            aria-label="Remove picture"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: To add new pictures, use the recruiter job edit page.
                    </p>
                  </div>
                )}
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
                      <Link
                        href={`/jobs/${job.id}`}
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
          </>
        )}

        {/* Modals - Outside tabs for global access */}
        {editingCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 my-8">
              <h2 className="text-2xl font-bold mb-4">Edit Company</h2>
              <div className="space-y-4 max-h-[80vh] overflow-y-auto">
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
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                  
                  {/* Step 1: Search for location */}
                  <LocationSearchSection
                    searchQuery={companySearchQuery}
                    setSearchQuery={setCompanySearchQuery}
                    searchResults={companySearchResults}
                    showResults={showCompanySearchResults}
                    setShowResults={setShowCompanySearchResults}
                    searching={searchingCompany}
                    searchContainerRef={companySearchContainerRef}
                    onLocationSelect={handleCompanyLocationSelect}
                  />

                  {/* Address fields (auto-filled but editable) */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={companyEditForm.address.street}
                        onChange={(e) =>
                          setCompanyEditForm({
                            ...companyEditForm,
                            address: { ...companyEditForm.address, street: e.target.value },
                          })
                        }
                        placeholder="e.g., 123 Main St"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={companyEditForm.address.city}
                          onChange={(e) =>
                            setCompanyEditForm({
                              ...companyEditForm,
                              address: { ...companyEditForm.address, city: e.target.value },
                            })
                          }
                          placeholder="e.g., San Diego"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                        <input
                          type="text"
                          value={companyEditForm.address.state}
                          onChange={(e) =>
                            setCompanyEditForm({
                              ...companyEditForm,
                              address: { ...companyEditForm.address, state: e.target.value },
                            })
                          }
                          placeholder="e.g., CA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input
                          type="text"
                          value={companyEditForm.address.postalCode}
                          onChange={(e) =>
                            setCompanyEditForm({
                              ...companyEditForm,
                              address: { ...companyEditForm.address, postalCode: e.target.value },
                            })
                          }
                          placeholder="e.g., 92101"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={companyEditForm.address.country}
                          onChange={(e) =>
                            setCompanyEditForm({
                              ...companyEditForm,
                              address: { ...companyEditForm.address, country: e.target.value },
                            })
                          }
                          placeholder="e.g., USA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Map with draggable marker */}
                  {companyEditForm.coordinates && companyMapMounted && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fine-tune Location (drag the pin if needed)
                      </label>
                      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                        <DraggableMap
                          latitude={companyEditForm.coordinates.latitude}
                          longitude={companyEditForm.coordinates.longitude}
                          onLocationChange={handleCompanyLocationChange}
                          companyName={companyEditForm.name || 'Location'}
                        />
                      </div>
                      <CoordinatesDisplay 
                        latitude={companyEditForm.coordinates.latitude}
                        longitude={companyEditForm.coordinates.longitude}
                      />
                    </div>
                  )}
                </div>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                      <input
                        type="url"
                        value={companyEditForm.socialMedia.facebook}
                        onChange={(e) =>
                          setCompanyEditForm({
                            ...companyEditForm,
                            socialMedia: { ...companyEditForm.socialMedia, facebook: e.target.value },
                          })
                        }
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                      <input
                        type="url"
                        value={companyEditForm.socialMedia.instagram}
                        onChange={(e) =>
                          setCompanyEditForm({
                            ...companyEditForm,
                            socialMedia: { ...companyEditForm.socialMedia, instagram: e.target.value },
                          })
                        }
                        placeholder="https://instagram.com/yourpage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
                      <input
                        type="url"
                        value={companyEditForm.socialMedia.tiktok}
                        onChange={(e) =>
                          setCompanyEditForm({
                            ...companyEditForm,
                            socialMedia: { ...companyEditForm.socialMedia, tiktok: e.target.value },
                          })
                        }
                        placeholder="https://tiktok.com/@yourpage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                      <input
                        type="url"
                        value={companyEditForm.socialMedia.youtube}
                        onChange={(e) =>
                          setCompanyEditForm({
                            ...companyEditForm,
                            socialMedia: { ...companyEditForm.socialMedia, youtube: e.target.value },
                          })
                        }
                        placeholder="https://youtube.com/@yourchannel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                  </div>
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

        {/* Location Required Modal */}
        {showCompanyLocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Required</h2>
              <p className="text-gray-700 mb-6">
                Please define the location of your company. If you can not find it, type the name of the closest town and move the Pin on the map to your location.
              </p>
              <button
                onClick={() => setShowCompanyLocationModal(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

