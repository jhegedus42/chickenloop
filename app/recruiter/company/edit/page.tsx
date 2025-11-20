'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { companyApi } from '@/lib/api';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const DraggableMap = dynamic(
  () => import('../../../components/DraggableMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg">
        <span className="text-gray-500">Loading map...</span>
      </div>
    )
  }
);

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

export default function EditCompanyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mapMounted, setMapMounted] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'recruiter') {
      router.push(`/${user.role === 'admin' ? 'admin' : 'job-seeker'}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'recruiter') {
      loadCompany();
    }
  }, [user]);

  const loadCompany = async () => {
    try {
      const data = await companyApi.get();
      const existingAddress = data.company.address || {};
      const existingSocialMedia = data.company.socialMedia || {};
      
      setFormData({
        name: data.company.name,
        description: data.company.description || '',
        address: {
          street: existingAddress.street || '',
          city: existingAddress.city || '',
          state: existingAddress.state || '',
          postalCode: existingAddress.postalCode || '',
          country: existingAddress.country || '',
        },
        coordinates: data.company.coordinates || null,
        website: data.company.website || '',
        socialMedia: {
          facebook: existingSocialMedia.facebook || '',
          instagram: existingSocialMedia.instagram || '',
          tiktok: existingSocialMedia.tiktok || '',
          youtube: existingSocialMedia.youtube || '',
        },
      });

      // Build search query from address if coordinates exist
      if (data.company.coordinates) {
        const addressParts = [];
        if (existingAddress.street) addressParts.push(existingAddress.street);
        if (existingAddress.city) addressParts.push(existingAddress.city);
        if (existingAddress.state) addressParts.push(existingAddress.state);
        if (existingAddress.postalCode) addressParts.push(existingAddress.postalCode);
        if (existingAddress.country) addressParts.push(existingAddress.country);
        const searchQuery = addressParts.join(', ') || data.company.name;
        setSearchQuery(searchQuery);
        setMapMounted(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load company');
    } finally {
      setFetching(false);
    }
  };

  // Handle clicks outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for locations when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (response.ok && data.results) {
          setSearchResults(data.results);
          setShowResults(true);
        }
      } catch (err) {
        // Silently handle errors
      } finally {
        setSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Mount map when coordinates are set
  useEffect(() => {
    if (formData.coordinates) {
      setMapMounted(true);
    }
  }, [formData.coordinates]);

  const handleLocationSelect = (result: any) => {
    setFormData({
      ...formData,
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
    setSearchQuery(result.displayName);
    setShowResults(false);
    setMapMounted(true);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      coordinates: {
        latitude: lat,
        longitude: lng,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate that coordinates are set
    if (!formData.coordinates || !formData.coordinates.latitude || !formData.coordinates.longitude) {
      setShowLocationModal(true);
      return;
    }

    setLoading(true);

    try {
      await companyApi.update(formData);
      router.push('/recruiter');
    } catch (err: any) {
      setError(err.message || 'Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) {
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
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Company Profile</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
              
              {/* Step 1: Search for location */}
              <div className="mb-4 relative" ref={searchContainerRef}>
                <label htmlFor="location-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search for your location *
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Search for your location by entering your company name. (If we can not find your company, enter a location nearby. A map will pop up on which you can move the Pin to the correct location)
                </p>
                <input
                  id="location-search"
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
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(result)}
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

              {/* Address fields (auto-filled but editable) */}
              <div className="space-y-4 mb-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                    placeholder="e.g., 123 Main St"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      placeholder="e.g., San Diego"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      placeholder="e.g., CA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, postalCode: e.target.value },
                        })
                      }
                      placeholder="e.g., 92101"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={formData.address.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, country: e.target.value },
                        })
                      }
                      placeholder="e.g., USA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Map with draggable marker */}
              {formData.coordinates && mapMounted && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fine-tune Location (drag the pin if needed)
                  </label>
                  <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                    <DraggableMap
                      latitude={formData.coordinates.latitude}
                      longitude={formData.coordinates.longitude}
                      onLocationChange={handleLocationChange}
                      companyName={formData.name || 'Location'}
                    />
                  </div>
                  <CoordinatesDisplay 
                    latitude={formData.coordinates.latitude}
                    longitude={formData.coordinates.longitude}
                  />
                </div>
              )}
            </div>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook URL
                  </label>
                  <input
                    id="facebook"
                    type="url"
                    value={formData.socialMedia.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, facebook: e.target.value },
                      })
                    }
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram URL
                  </label>
                  <input
                    id="instagram"
                    type="url"
                    value={formData.socialMedia.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/yourpage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok URL
                  </label>
                  <input
                    id="tiktok"
                    type="url"
                    value={formData.socialMedia.tiktok}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, tiktok: e.target.value },
                      })
                    }
                    placeholder="https://tiktok.com/@yourpage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube URL
                  </label>
                  <input
                    id="youtube"
                    type="url"
                    value={formData.socialMedia.youtube}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, youtube: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Updating...' : 'Update Company'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Location Required Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Required</h2>
            <p className="text-gray-700 mb-6">
              Please define the location of your company. If you can not find it, type the name of the closest town and move the Pin on the map to your location.
            </p>
            <button
              onClick={() => setShowLocationModal(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


