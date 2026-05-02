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
    default: "Tanvir Ahmed — Full-Stack Developer",
    template: "%s — Tanvir Ahmed",
  },
  description:
    "Portfolio of Tanvir Ahmed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
  keywords: [
    "full-stack developer",
    "React developer",
    "Next.js developer",
    "Node.js",
    "TypeScript",
    "web developer",
    "Tanvir Ahmed",
    "portfolio",
  ],
  authors: [{ name: "Tanvir Ahmed", url: SITE_URL }],
  creator: "Tanvir Ahmed",
  openGraph: {
    type: "website",
    siteName: "Tanvir Ahmed — Portfolio",
    locale: "en_US",
    url: SITE_URL,
    title: "Tanvir Ahmed — Full-Stack Developer",
    description:
      "Portfolio of Tanvir Ahmed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tanvir Ahmed — Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanvir Ahmed — Full-Stack Developer",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${departureMono.variable}`}>
      <head>
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
