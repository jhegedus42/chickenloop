'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { CookieConsentProvider } from '../contexts/CookieConsentContext';
import CookieConsentBanner from './CookieConsentBanner';
import Footer from './Footer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CookieConsentProvider>
        <>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <CookieConsentBanner />
        </>
      </CookieConsentProvider>
    </AuthProvider>
  );
}

