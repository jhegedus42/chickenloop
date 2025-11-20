'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { jobsApi, companyApi } from '@/lib/api';
import { OFFICIAL_LANGUAGES } from '@/lib/languages';
import { QUALIFICATIONS } from '@/lib/qualifications';
import { getCountryNameFromCode } from '@/lib/countryUtils';

export default function EditJobPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    country: '',
    salary: '',
    type: 'full-time',
    languages: [] as string[],
    qualifications: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [existingPictures, setExistingPictures] = useState<string[]>([]);
  const [selectedPictures, setSelectedPictures] = useState<File[]>([]);
  const [picturePreviews, setPicturePreviews] = useState<string[]>([]);
  const [uploadingPictures, setUploadingPictures] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'recruiter') {
      router.push(`/${user.role === 'admin' ? 'admin' : 'job-seeker'}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'recruiter' && jobId) {
      loadData();
    }
  }, [user, jobId]);

  const loadData = async () => {
    // Load company first, then job (so we can use company's location as fallback)
    let companyData = null;
    try {
      const companyResponse = await companyApi.get();
      companyData = companyResponse.company;
      setCompany(companyData);
    } catch (err: any) {
      // Company might not exist for old jobs, but we'll show the job's company
    }
    
    // Load job and use company's location as fallback if job doesn't have it
    try {
      const data = await jobsApi.getOne(jobId);
      const job = data.job;
      
      // Use job's location if available, otherwise fall back to company's city
      const jobLocation = job.location || '';
      const fallbackLocation = companyData?.address?.city || '';
      const locationToUse = jobLocation || fallbackLocation;
      
      // Use job's country if available (handle null/undefined), otherwise fall back to company's country
      const jobCountry = (job as any).country != null ? (job as any).country : '';
      const fallbackCountry = companyData?.address?.country || '';
      const countryToUse = jobCountry || fallbackCountry;
      
      setFormData({
        title: job.title,
        description: job.description,
        location: locationToUse,
        country: countryToUse,
        salary: job.salary || '',
        type: job.type,
        languages: (job as any).languages || [],
        qualifications: (job as any).qualifications || [],
      });
      setExistingPictures((job as any).pictures || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load job');
    } finally {
      setFetching(false);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPictures = existingPictures.length + selectedPictures.length + files.length;
    
    if (totalPictures > 3) {
      setError('Maximum 3 pictures allowed (including existing ones)');
      return;
    }

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only images (JPEG, PNG, WEBP, GIF) are allowed.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
    }

    const newPictures = [...selectedPictures, ...files];
    setSelectedPictures(newPictures);
    setError('');

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPicturePreviews([...picturePreviews, ...newPreviews]);
  };

  const removeExistingPicture = (index: number) => {
    const newPictures = existingPictures.filter((_, i) => i !== index);
    setExistingPictures(newPictures);
  };

  const removeNewPicture = (index: number) => {
    const newPictures = selectedPictures.filter((_, i) => i !== index);
    const newPreviews = picturePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(picturePreviews[index]);
    
    setSelectedPictures(newPictures);
    setPicturePreviews(newPreviews);
  };

  const uploadPictures = async (): Promise<string[]> => {
    if (selectedPictures.length === 0) return existingPictures;

    setUploadingPictures(true);
    try {
      const uploadFormData = new FormData();
      selectedPictures.forEach((file) => {
        uploadFormData.append('pictures', file);
      });

      const response = await fetch('/api/jobs/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload pictures');
      }

      // Merge existing pictures with newly uploaded ones
      return [...existingPictures, ...(data.paths || [])];
    } finally {
      setUploadingPictures(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload new pictures first, merge with existing ones
      const allPicturePaths = await uploadPictures();

      // Update job with picture paths
      await jobsApi.update(jobId, {
        ...formData,
        pictures: allPicturePaths,
      });

      // Clean up preview URLs
      picturePreviews.forEach(url => URL.revokeObjectURL(url));

      router.push('/recruiter');
    } catch (err: any) {
      setError(err.message || 'Failed to update job');
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Job</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                id="company"
                type="text"
                value={company?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">This is your company profile. To change it, edit your company profile.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
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
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                  placeholder="e.g., US, GB, FR"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 uppercase"
                />
                {formData.country && (
                  <p className="mt-1 text-xs text-gray-500">
                    {getCountryNameFromCode(formData.country)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Job Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <input
                id="salary"
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g., $50,000 - $70,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Required (Optional - up to 3)
              </label>
              
              {/* Selected Languages Display */}
              {formData.languages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            languages: formData.languages.filter((l) => l !== lang),
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
                  const isSelected = formData.languages.includes(lang);
                  const isDisabled = !isSelected && formData.languages.length >= 3;
                  
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
                            if (formData.languages.length < 3) {
                              setFormData({
                                ...formData,
                                languages: [...formData.languages, lang],
                              });
                            }
                          } else {
                            setFormData({
                              ...formData,
                              languages: formData.languages.filter((l) => l !== lang),
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
                {formData.languages.length > 0 
                  ? `${formData.languages.length} of 3 languages selected`
                  : 'Select up to 3 languages (tap to select)'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Qualifications (Optional)
              </label>
              
              {/* Selected Qualifications Display */}
              {formData.qualifications.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.qualifications.map((qual) => (
                    <span
                      key={qual}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {qual}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            qualifications: formData.qualifications.filter((q) => q !== qual),
                          });
                        }}
                        className="ml-2 text-green-600 hover:text-green-800"
                        aria-label={`Remove ${qual}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Qualifications Checkbox List with Subheaders */}
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 bg-white">
                {QUALIFICATIONS.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="mb-4 last:mb-0">
                    {/* Subheader - Non-selectable */}
                    <div className="sticky top-0 bg-gray-100 px-2 py-2 mb-2 rounded font-semibold text-sm text-gray-700 border-b border-gray-200">
                      {category.header}
                    </div>
                    {/* Qualification Items */}
                    {category.items.map((qual) => {
                      const isSelected = formData.qualifications.includes(qual);
                      
                      return (
                        <label
                          key={qual}
                          className="flex items-center py-2 px-2 ml-4 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  qualifications: [...formData.qualifications, qual],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  qualifications: formData.qualifications.filter((q) => q !== qual),
                                });
                              }
                            }}
                            className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900">{qual}</span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {formData.qualifications.length > 0 
                  ? `${formData.qualifications.length} qualification(s) selected`
                  : 'Select required qualifications (tap to select)'}
              </p>
            </div>
            <div>
              <label htmlFor="pictures" className="block text-sm font-medium text-gray-700 mb-1">
                Pictures (Optional - up to 3 total)
              </label>
              {existingPictures.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Existing Pictures:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {existingPictures.map((picture, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={picture}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingPicture(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
                          aria-label="Remove picture"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <input
                id="pictures"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={handlePictureChange}
                disabled={existingPictures.length + selectedPictures.length >= 3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum 3 pictures total (including existing ones), 5MB each. Supported formats: JPEG, PNG, WEBP, GIF
              </p>
              {selectedPictures.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">New Pictures:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {picturePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewPicture(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
                          aria-label="Remove picture"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Updating...' : 'Update Job'}
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
    </div>
  );
}

