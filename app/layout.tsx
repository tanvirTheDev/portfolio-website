import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const departureMono = localFont({
  src: "../public/fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure",
  weight: "400",
  style: "normal",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// Hardcoded GA ID — env var overrides if set (e.g. for staging with different property)
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5HLMGC95PB";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tanvir Ahamed — Full-Stack Developer",
    template: "%s | Tanvir Ahamed",
  },
  description:
    "Portfolio of Tanvir Ahamed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products. Known as tanvirthedev and Tanvir the Dev.",
  keywords: [
    "Tanvir Ahamed",
    "tanvirthedev",
    "tanvir the dev",
    "tanvir ahamed developer",
    "full-stack developer",
    "React developer",
    "Next.js developer",
    "Node.js developer",
    "TypeScript developer",
    "freelance web developer",
    "Upwork developer",
    "portfolio",
  ],
  authors: [{ name: "Tanvir Ahamed", url: SITE_URL }],
  creator: "Tanvir Ahamed",
  openGraph: {
    type: "website",
    siteName: "Tanvir Ahamed — Portfolio",
    locale: "en_US",
    url: SITE_URL,
    title: "Tanvir Ahamed — Full-Stack Developer",
    description:
      "Portfolio of Tanvir Ahamed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tanvir Ahamed — Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanvir Ahamed — Full-Stack Developer",
    description:
      "Full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
    images: ["/opengraph-image"],
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
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

// WebSite schema — helps Google create a sitelinks search box and associate
// the site with the person "Tanvir Ahamed / tanvirthedev"
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tanvir Ahamed — Portfolio",
  alternateName: ["tanvirthedev", "Tanvir Ahamed Portfolio", "Tanvir the Dev"],
  url: SITE_URL,
  author: {
    "@type": "Person",
    name: "Tanvir Ahamed",
    alternateName: ["tanvirthedev", "Tanvir the Dev"],
    url: SITE_URL,
    sameAs: ["https://github.com/tanvirTheDev", "https://www.upwork.com/freelancers/tanvirthedev"],
  },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/work?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${departureMono.variable}`}>
      <head>
        {/* WebSite structured data — site-level identity for Google + AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* llms.txt — signals AI crawlers where to find plain-text site info */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs information" />
        {/* Google tag (gtag.js) — G-5HLMGC95PB */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body>
        {children}
        {/* Vercel Analytics — tracks page views automatically on Vercel */}
        <Analytics />
        {/* Vercel Speed Insights — tracks Core Web Vitals on Vercel */}
        <SpeedInsights />
      </body>
    </html>
  );
}
