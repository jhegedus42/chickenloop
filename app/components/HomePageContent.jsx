'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { jobsApi } from '@/lib/api';
import { useAuth } from '../contexts/AuthContext';
import JobCard from './JobCard';
import CompanyCard from './CompanyCard';
import CandidateCard from './CandidateCard';
import SectionHeader from './SectionHeader';
import SearchBar from './SearchBar';
import CompaniesPreview from './CompaniesPreview';
import MapPreview from './MapPreview';

export default function HomePageContent() {
  const { user } = useAuth();
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
  const [topCandidates, setTopCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);

  useEffect(() => {
    // Load jobs to extract unique categories
    loadJobs();
    // Load latest jobs for display
    loadLatestJobs();
    // Load featured companies
    loadFeaturedCompanies();
    // Load top candidates (only if user is recruiter or admin)
    if (user && (user.role === 'recruiter' || user.role === 'admin')) {
      loadTopCandidates();
    }
  }, [user]);

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
      // Get the 4 most recent jobs (already sorted by updatedAt -1 from API)
      setLatestJobs(jobsList.slice(0, 4));
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

  const loadTopCandidates = async () => {
    try {
      const response = await fetch('/api/candidates-list');
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      const data = await response.json();
      const candidates = data.cvs || [];
      // Get the first 4 candidates (already sorted by newest first from API)
      setTopCandidates(candidates.slice(0, 4));
    } catch (err) {
      console.error('Failed to load top candidates:', err);
    } finally {
      setCandidatesLoading(false);
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
      <header className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Left */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center transition-transform hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="ChickenLoop logo"
                  width={200}
                  height={60}
                  priority
                  className="h-auto w-auto max-h-12 sm:max-h-14"
                />
              </Link>
            </div>

            {/* Desktop Buttons - Right */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <Link
                href="/recruiter/jobs/new"
                className="px-4 lg:px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Post a Job
              </Link>
              <Link
                href="/job-seeker/cv/new"
                className="px-4 lg:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Upload Resume
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:text-blue-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300"
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
            <div className="md:hidden pb-4 border-t border-blue-700 bg-blue-600">
              <div className="flex flex-col space-y-2 pt-4">
                <Link
                  href="/recruiter/jobs/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-center shadow-md"
                >
                  Post a Job
                </Link>
                <Link
                  href="/job-seeker/cv/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium text-center shadow-md"
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
        <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/Kitesurfer.jpg"
              alt="Kitesurfer background"
              fill
              priority
              className="object-cover"
              quality={90}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-teal-900/70"></div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
              Find Your Next Watersports Job
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 drop-shadow-md max-w-2xl mx-auto">
              Kite, foil, surf, sail or dive — discover opportunities worldwide.
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
        <SearchBar
          keyword={keyword}
          location={location}
          category={category}
          categories={getUniqueCategories()}
          categoriesLoading={categoriesLoading}
          onKeywordChange={setKeyword}
          onLocationChange={setLocation}
          onCategoryChange={setCategory}
        />
        
        {/* Latest Jobs Section */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Latest Jobs"
              actionLabel="View All Jobs"
              actionHref="/jobs-list"
            />
            
            {latestJobsLoading ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">Loading jobs...</p>
              </div>
            ) : latestJobs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No jobs available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {latestJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Featured Companies Section */}
        <section className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Featured Companies" />
            
            {companiesLoading ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">Loading companies...</p>
              </div>
            ) : featuredCompanies.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No companies available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {featuredCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Companies Preview Section */}
        <CompaniesPreview />
        
        {/* Map Preview Section */}
        <MapPreview />
        
        {/* Top Candidates Section - Only visible to recruiters and admins */}
        {user && (user.role === 'recruiter' || user.role === 'admin') && (
          <section className="bg-gray-50 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader title="Top Candidates" />
              
              {candidatesLoading ? (
                <div className="text-center py-16">
                  <p className="text-gray-600 text-lg">Loading candidates...</p>
                </div>
              ) : topCandidates.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-600 text-lg">No candidates available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {topCandidates.map((candidate) => (
                    <CandidateCard key={candidate._id} candidate={candidate} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
