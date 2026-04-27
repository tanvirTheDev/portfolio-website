import type { Metadata } from "next";
import { Suspense } from "react";
import GridBg from "@/components/shell/GridBg";
import DocStrip from "@/components/shell/DocStrip";
import SideNav from "@/components/shell/SideNav";
import Cursor from "@/components/shell/Cursor";
import KeyboardNav from "@/components/shell/KeyboardNav";
import MotionProvider from "@/components/motion/MotionProvider";
import PageTransition from "@/components/motion/PageTransition";
import RevealObserver from "@/components/motion/RevealObserver";
import { getSiteSettings } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: { template: "%s — Portfolio", default: "Portfolio" },
  description: "Full-Stack Developer Portfolio",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Fetch once per layout render; cached by Next.js fetch deduplication
  const settings = await getSiteSettings().catch(() => null);

  const name = settings?.name ?? "PORTFOLIO";
  const tagline = settings?.tagline ?? "FULL-STACK DEVELOPER";

  return (
    <MotionProvider>
      {/* Skip-to-content for keyboard / screen-reader users */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Fixed chrome — never transitions */}
      <GridBg />
      <DocStrip />
      <SideNav name={name} tagline={tagline} />
      <Cursor />
      <KeyboardNav />

      {/* Scroll-reveal watcher — re-runs on every navigation */}
      <RevealObserver />

      {/* Page content with enter animation.
          Suspense boundary required because framer-motion's AnimatePresence
          calls Math.random() internally — Next.js 16 PPR flags this otherwise. */}
      <main id="main-content" className="main">
        <Suspense>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </main>
    </MotionProvider>
  );
}
