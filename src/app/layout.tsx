import type { Metadata, Viewport } from "next";
import { Mukta, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

// UI text: clean humanist face covering both Devanagari and Latin.
const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Scripture text (chaupai, grid letters, titles): calligraphic Devanagari,
// the same face the brand ॐ is drawn from. Single weight — never bold it.
const tiro = Tiro_Devanagari_Hindi({
  variable: "--font-tiro",
  subsets: ["devanagari"],
  weight: "400",
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: "#92400e",
  width: "device-width",
  initialScale: 1,
};

const baseUrl = 'https://ramcharitmanas.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: { canonical: '/' },
  title: {
    default: "श्री राम प्रश्नावली | Ram Prashnavali - Ram Shalaka",
    template: "%s | Ram Prashnavali",
  },
  description: "श्री राम प्रश्नावली - रामचरितमानस की शालाका से ईश्वरीय मार्गदर्शन प्राप्त करें। Ram Prashnavali - Seek divine guidance through Shri Ram Shalaka from Goswami Tulsidas's Ramcharitmanas.",
  keywords: [
    "राम प्रश्नावली", "Ram Prashnavali", "राम शलाका", "Ram Shalaka",
    "श्रीरामचरितमानस", "Ramcharitmanas", "तुलसीदास", "Tulsidas",
    "रामचरित मानस प्रश्नोत्तर", "Ram Shalaka Prashnavali",
    "Hindu divination", "Ram Shalaka online", "राम शलाका ऑनलाइन",
    "चौपाई", "Chaupai", "शुभ अशुभ", "prashna uttar",
  ],
  authors: [{ name: "Ram Prashnavali" }],
  creator: "Ram Prashnavali",
  publisher: "Ram Prashnavali",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: baseUrl,
    siteName: "श्री राम प्रश्नावली | Ram Prashnavali",
    title: "श्री राम प्रश्नावली | Ram Prashnavali",
    description: "रामचरितमानस की राम शलाका से अपने प्रश्न का उत्तर पाएं। शुभ-अशुभ फल, चौपाई, और शिक्षा। Seek answers through Ram Shalaka from Ramcharitmanas.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "श्री राम प्रश्नावली | Ram Prashnavali",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "श्री राम प्रश्नावली | Ram Prashnavali",
    description: "रामचरितमानस की राम शलाका से अपने प्रश्न का उत्तर पाएं।",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ram Prashnavali",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "श्री राम प्रश्नावली",
    alternateName: "Ram Prashnavali",
    url: baseUrl,
    description: "Seek divine guidance through Shri Ram Shalaka from Ramcharitmanas. Get answers to your questions through ancient Hindu divination.",
    applicationCategory: "SpiritualApplication",
    operatingSystem: "All",
    inLanguage: ["hi", "en"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    author: {
      "@type": "Organization",
      name: "Ram Prashnavali",
    },
  };

  return (
    <html
      lang="hi"
      suppressHydrationWarning
      className={`${mukta.variable} ${tiro.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
