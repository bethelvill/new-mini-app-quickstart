import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { RQProvider } from '@/layouts/RQProvider';
import { Toaster } from 'sonner';
import GoogleAuthWrapper from '@/components/GoogleAuthWrapper';
import { PostHogProvider, PostHogPageView } from '@/providers/PostHogProvider';
import { Suspense } from 'react';
import MaintenanceDialog from '@/components/MaintenanceDialog';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://showstakr.tournest.io'),
  title: {
    default: 'ShowStakr - Entertainment Prediction Game | Win Real Money',
    template: '%s | ShowStakr',
  },
  description:
    "Play prediction games on your favorite entertainment shows and events on ShowStakr! Stake on outcomes, compete with other players, and win real money. Nigeria's #1 entertainment prediction gaming platform.",
  keywords: [
    // Primary Keywords
    'prediction game',
    'entertainment predictions',
    'prediction gaming',
    'Nigerian entertainment',
    'entertainment betting',
    'prediction platform',
    'stake and win',
    'prediction contests',
    'entertainment gaming',
    'show predictions',
    'event predictions',
    'winner prediction',

    // Entertainment Keywords
    'Nigerian shows',
    'entertainment shows',
    'TV show predictions',
    'show outcomes',
    'entertainment events',
    'Nigerian entertainment platform',
    'African entertainment',
    'entertainment competitions',
    'show contests',
    'entertainment challenges',

    // General Gaming Keywords
    'prediction gaming platform',
    'entertainment gaming',
    'prediction contests',
    'gaming predictions',
    'Nigerian gaming',
    'African gaming platform',
    'entertainment stake',
    'prediction betting platform',

    // Action Keywords
    'predict and win',
    'stake and win',
    'bet on entertainment shows',
    'win money online',
    'online predictions',
    'prediction platform',
    'entertainment betting',
    'peer to peer betting',
    'P2P predictions',

    // Location Keywords
    'Nigeria betting',
    'Lagos betting platform',
    'Abuja predictions',
    'Nigerian entertainment',
    'Naija predictions',
    'Nigerian online betting',

    // Brand Keywords
    'ShowStakr',
    'ShowStakr Nigeria',
    'ShowStakr predictions',
    'ShowStakr app',
    'ShowStakr platform',

    // Long-tail Keywords
    'how to play prediction games',
    'entertainment predictions today',
    'prediction game winners',
    'competition predictions',
    'best prediction gaming site',
    'Nigerian entertainment prediction platform',
    'win money predicting shows',
    'entertainment betting Nigeria',
    'prediction gaming platform',
    'stake on show outcomes',
  ],
  authors: [{ name: 'ShowStakr Team' }],
  creator: 'ShowStakr',
  publisher: 'ShowStakr',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ShowStakr - Entertainment Prediction Game | Win Real Money',
    description:
      "Play prediction games on Nigerian entertainment shows and events on ShowStakr! Stake on outcomes, compete with other players, and win real money. Join thousands competing on Nigeria's premier prediction gaming platform.",
    url: 'https://showstakr.tournest.io',
    siteName: 'ShowStakr',
    images: [
      {
        url: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824146/Screenshot_2025-08-10_at_8.50.36_AM_pqxy9i.png',
        width: 1200,
        height: 630,
        alt: 'ShowStakr - Entertainment Prediction Gaming Platform',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShowStakr - Prediction Games & Win',
    description:
      'Play prediction games and win real money on ShowStakr! Stake on entertainment show outcomes and compete with other players.',
    images: ['https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824146/Screenshot_2025-08-10_at_8.50.36_AM_pqxy9i.png'],
    creator: '@showstakr',
    site: '@showstakr',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg', type: 'image/svg+xml' },
      { url: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: [{ url: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg' }],
    other: [
      {
        rel: 'mask-icon',
        url: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg',
      },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://showstakr.tournest.io',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  category: 'entertainment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ShowStakr - Entertainment Prediction Games',
    alternateName: 'ShowStakr Nigeria',
    description:
      "Nigeria's premier prediction gaming platform for entertainment shows and events. Stake on outcomes, compete in predictions, and win real money from other players.",
    url: 'https://showstakr.tournest.io',
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Any',
    keywords:
      'prediction games, entertainment predictions, Nigerian shows, entertainment betting, prediction platform, gaming predictions, show outcomes, entertainment events',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Free to join and start predicting',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2450',
      bestRating: '5',
      worstRating: '1',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ShowStakr',
      alternateName: 'ShowStakr Nigeria',
      url: 'https://showstakr.tournest.io',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/dnvsfxlan/image/upload/v1754824130/Group_1000001891_2_tybmb9.svg',
      },
      sameAs: [
        'https://twitter.com/tournest',
        'https://instagram.com/tournest',
        'https://facebook.com/tournest',
      ],
    },
    potentialAction: {
      '@type': 'ViewAction',
      target: 'https://showstakr.tournest.io/polls',
      name: 'Play Prediction Games',
    },
  };

  return (
    <html lang='en' className='dark'>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <PostHogProvider>
          <GoogleAuthWrapper>
            <RQProvider>
              <Suspense>
                <PostHogPageView />
              </Suspense>
              <Navbar />
              <Toaster
                position='top-right'
                toastOptions={{
                  style: {
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                }}
              />
              <MaintenanceDialog />
              <main className='min-h-screen'>{children}</main>
              <Footer />
            </RQProvider>
          </GoogleAuthWrapper>
        </PostHogProvider>
      </body>
    </html>
  );
}
