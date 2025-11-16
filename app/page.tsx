import Navbar from './components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to ChickenLoop
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your gateway to watersports careers
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">For Job Seekers</h2>
            <p className="text-gray-600 mb-4">
              Create your CV and browse watersports job opportunities
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Create and manage your CV</li>
              <li>Browse all available jobs</li>
              <li>Find your dream watersports career</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">For Recruiters</h2>
            <p className="text-gray-600 mb-4">
              Post job openings and find the perfect candidates
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Post job listings</li>
              <li>Manage your job postings</li>
              <li>Reach qualified candidates</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Watersports Focus</h2>
            <p className="text-gray-600 mb-4">
              Specialized platform for watersports industry
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Kitesurfing instructors</li>
              <li>Windsurfing coaches</li>
              <li>Water sports equipment specialists</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
