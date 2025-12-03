'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { jobsApi } from '@/lib/api';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [allJobs, setAllJobs] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    // Load jobs to extract unique categories
    loadJobs();
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Additional content area - ready for future content */}
        </div>
      </main>
    </div>
  );
}

