'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { jobsApi } from '@/lib/api';
import { getCountryNameFromCode } from '@/lib/countryUtils';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [allJobs, setAllJobs] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [latestJobs, setLatestJobs] = useState([]);
  const [latestJobsLoading, setLatestJobsLoading] = useState(true);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  useEffect(() => {
    // Load jobs to extract unique categories
    loadJobs();
    // Load latest jobs for display
    loadLatestJobs();
    // Load featured companies
    loadFeaturedCompanies();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await jobsApi.getAll();
      const jobsList = data.jobs || [];
      setAllJobs(jobsList);
    } catch (err) {
      // Silently fail - categories will just be empty
      console.error('Failed to load jobs for categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadLatestJobs = async () => {
    try {
      const response = await fetch('/api/jobs-list');
      const data = await response.json();
      const jobsList = data.jobs || [];
      // Get the 6 most recent jobs (already sorted by createdAt -1 from API)
      setLatestJobs(jobsList.slice(0, 6));
    } catch (err) {
      console.error('Failed to load latest jobs:', err);
    } finally {
      setLatestJobsLoading(false);
    }
  };

  const loadFeaturedCompanies = async () => {
    try {
      // Fetch featured companies and jobs in parallel
      const [companiesResponse, jobsResponse] = await Promise.all([
        fetch('/api/companies-list?featured=true'),
        fetch('/api/jobs-list')
      ]);
      
      const companiesData = await companiesResponse.json();
      const jobsData = await jobsResponse.json();
      
      const companies = companiesData.companies || [];
      const jobs = jobsData.jobs || [];
      
      // Count active (published) jobs per company
      // Match by companyId or by company name as fallback
      const jobCountsByCompany = {};
      const companyIdMap = {}; // Map company name to company ID
      
      companies.forEach((company) => {
        companyIdMap[company.name] = company.id;
      });
      
      jobs.forEach((job) => {
        if (job.published !== false) {
          let companyId = null;
          
          // Try to get companyId from job object
          if (job.companyId) {
            companyId = job.companyId._id || job.companyId.id || job.companyId;
          }
          
          // Fallback: match by company name
          if (!companyId && job.company && companyIdMap[job.company]) {
            companyId = companyIdMap[job.company];
          }
          
          if (companyId) {
            jobCountsByCompany[companyId] = (jobCountsByCompany[companyId] || 0) + 1;
          }
        }
      });
      
      // Add job count to each company and get first 6
      const companiesWithJobCount = companies.slice(0, 6).map((company) => ({
        ...company,
        jobCount: jobCountsByCompany[company.id] || 0
      }));
      
      setFeaturedCompanies(companiesWithJobCount);
    } catch (err) {
      console.error('Failed to load featured companies:', err);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Get unique job categories from all jobs (same logic as jobs page)
  const getUniqueCategories = () => {
    const categorySet = new Set();
    
    allJobs.forEach((job) => {
      if (job.occupationalAreas && job.occupationalAreas.length > 0) {
        job.occupationalAreas.forEach((category) => {
          categorySet.add(category);
        });
      }
    });

    // Convert to array and sort alphabetically
    return Array.from(categorySet).sort();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="ChickenLoop logo"
                  width={200}
                  height={60}
                  priority
                  className="h-auto w-auto max-h-12"
                />
              </Link>
            </div>

            {/* Desktop Buttons - Right */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/recruiter/jobs/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Post a Job
              </Link>
              <Link
                href="/job-seeker/cv/new"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Upload Resume
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pt-4">
                <Link
                  href="/recruiter/jobs/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  Post a Job
                </Link>
                <Link
                  href="/job-seeker/cv/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-center"
                >
                  Upload Resume
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gray-300 opacity-20">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-400 text-sm">Background Image Placeholder</div>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
              Find Your Next Watersports Job
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 drop-shadow-md max-w-2xl mx-auto">
              Surf, sail, dive, or teach — discover opportunities worldwide.
            </p>
            <Link
              href="/jobs"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Browse Jobs
            </Link>
          </div>
        </section>
        
        {/* Search Bar Section */}
        <section className="bg-white py-8 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  // Navigation will be handled by the Link button
                }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {/* Keyword Input */}
                <div className="flex-1">
                  <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                    Keyword
                  </label>
                  <input
                    type="text"
                    id="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search jobs..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Location Input */}
                <div className="flex-1">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="flex-1">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    disabled={categoriesLoading}
                  >
                    <option value="">All Categories</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      getUniqueCategories().map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <Link
                    href={`/jobs-list?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}`}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
                  >
                    Search Jobs
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </section>
        
        {/* Latest Jobs Section */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Latest Jobs</h2>
              <Link
                href="/jobs-list"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                View All Jobs
              </Link>
            </div>
            
            {latestJobsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : latestJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestJobs.map((job) => {
                  // Get the first picture as thumbnail, or use placeholder
                  const thumbnail = job.pictures && job.pictures.length > 0 
                    ? job.pictures[0] 
                    : null;
                  
                  return (
                    <Link
                      key={job._id}
                      href={`/jobs/${job._id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                    >
                      {/* Thumbnail Image */}
                      <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={job.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                            <span className="text-gray-500 text-sm">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Job Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 font-medium">
                          {job.company}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <span className="mr-1">📍</span>
                          {job.location}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        
        {/* Featured Companies Section */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Companies</h2>
            
            {companiesLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading companies...</p>
              </div>
            ) : featuredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No companies available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCompanies.map((company) => {
                  // Format location/country
                  const locationParts = [];
                  if (company.address?.city) {
                    locationParts.push(company.address.city);
                  }
                  if (company.address?.country) {
                    const countryName = getCountryNameFromCode(company.address.country);
                    locationParts.push(countryName || company.address.country);
                  }
                  const locationText = locationParts.length > 0 
                    ? locationParts.join(', ') 
                    : 'Location not specified';
                  
                  return (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}`}
                      className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block"
                    >
                      {/* Company Logo */}
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center p-4">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm text-center">
                            <div className="text-2xl mb-1">🏢</div>
                            <div>No Logo</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Company Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                          <span className="mr-1">📍</span>
                          {locationText}
                        </p>
                        {company.jobCount > 0 && (
                          <p className="text-sm text-blue-600 font-medium">
                            {company.jobCount} {company.jobCount === 1 ? 'active job' : 'active jobs'}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Additional content area - ready for future content */}
        </div>
      </main>
    </div>
  );
}

