'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              ChickenLoop
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">Welcome, {user.name}</span>
                {user.role === 'job-seeker' && (
                  <Link
                    href="/jobs"
                    className="px-3 py-2 rounded hover:bg-blue-700"
                  >
                    Jobs
                  </Link>
                )}
                <Link
                  href={`/${user.role === 'admin' ? 'admin' : user.role === 'recruiter' ? 'recruiter' : 'job-seeker'}`}
                  className="px-3 py-2 rounded hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded hover:bg-blue-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded hover:bg-blue-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded bg-blue-500 hover:bg-blue-700 px-4 py-2"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

