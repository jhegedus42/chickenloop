'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center flex-shrink-0 min-w-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="ChickenLoop logo"
                  width={300}
                  height={80}
                  priority
                  className="h-auto w-auto max-h-10 sm:max-h-12 md:max-h-14"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              <Link
                href="/jobs"
                className="px-2 sm:px-3 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
              >
                Jobs
              </Link>
              {user && (user.role === 'recruiter' || user.role === 'admin') && (
                <Link
                  href="/candidates"
                  className="hidden sm:inline-block px-2 sm:px-3 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
                >
                  Candidates
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href={`/${user.role === 'admin' ? 'admin' : user.role === 'recruiter' ? 'recruiter' : 'job-seeker'}`}
                    className="px-2 sm:px-3 py-2 rounded hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dash</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-2 sm:px-3 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-2 sm:px-3 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Login
                  </Link>
                  <Link href="/register" className="px-2 sm:px-4 py-2 rounded bg-blue-500 hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {user && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end py-2">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

