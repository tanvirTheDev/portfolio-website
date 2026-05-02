import type { Metadata } from "next";
import { Suspense } from "react";
import GridBg from "@/components/shell/GridBg";
import DocStrip from "@/components/shell/DocStrip";
import SideNav from "@/components/shell/SideNav";
import Cursor from "@/components/shell/Cursor";
import KeyboardNav from "@/components/shell/KeyboardNav";
import BootSequence from "@/components/shell/BootSequence";
import MotionProvider from "@/components/motion/MotionProvider";
import PageTransition from "@/components/motion/PageTransition";
import RevealObserver from "@/components/motion/RevealObserver";
import { getSiteSettings, getAllProjects } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: { template: "%s — Portfolio", default: "Portfolio" },
  description: "Full-Stack Developer Portfolio",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, projects] = await Promise.all([
    getSiteSettings().catch(() => null),
    getAllProjects().catch(() => []),
  ]);

  const name = settings?.name ?? "PORTFOLIO";
  const tagline = settings?.tagline ?? "FULL-STACK DEVELOPER";

  return (
    <MotionProvider>
      {/* Skip-to-content for keyboard / screen-reader users */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Boot sequence — shows once per browser, before any content */}
      <BootSequence name={name} projectCount={projects.length} />

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
