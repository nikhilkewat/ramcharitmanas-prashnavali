import type { Metadata } from 'next';
import Header from '@/components/Header';
import DailyChaupai from './DailyChaupai';

const title = 'आज की चौपाई · Daily Chaupai';
const description =
  'रामचरितमानस से आज की चौपाई — अर्थ, प्रसंग, शिक्षा और निष्कर्ष सहित। Today’s chaupai from Shri Ramcharitmanas with meaning, context and guidance.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/daily' },
  openGraph: {
    type: 'website',
    url: '/daily',
    title,
    description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'श्री राम प्रश्नावली' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
};

export default function DailyPage() {
  return (
    <div className="min-h-screen pattern-bg">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <DailyChaupai />

        <footer className="text-center mt-12 py-6">
          <div className="divider-traditional text-gold mb-3">◆</div>
          <p className="text-ink-2 text-sm">श्रीरामचरितमानस · गोस्वामी तुलसीदास</p>
          <p className="text-ink-3 text-xs mt-1">Shri Ramcharitmanas · Goswami Tulsidas</p>
        </footer>
      </main>
    </div>
  );
}
