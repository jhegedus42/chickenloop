import type { Metadata } from 'next';
import HomePageContent from './components/HomePageContent';

export const metadata: Metadata = {
  title: 'Watersports Jobs Worldwide | Chickenloop',
  description: 'Find jobs in kitesurfing, surfing, sailing, diving, yachting, and more. Free job board for watersports professionals.',
  openGraph: {
    title: 'Watersports Jobs Worldwide | Chickenloop',
    description: 'Find jobs in kitesurfing, surfing, sailing, diving, yachting, and more. Free job board for watersports professionals.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Chickenloop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watersports Jobs Worldwide | Chickenloop',
    description: 'Find jobs in kitesurfing, surfing, sailing, diving, yachting, and more. Free job board for watersports professionals.',
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
