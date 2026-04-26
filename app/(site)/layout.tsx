import type { Metadata } from "next";
import GridBg from "@/components/shell/GridBg";
import DocStrip from "@/components/shell/DocStrip";
import SideNav from "@/components/shell/SideNav";
import Cursor from "@/components/shell/Cursor";
import KeyboardNav from "@/components/shell/KeyboardNav";
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
    <>
      {/* Fixed chrome — always visible */}
      <GridBg />
      <DocStrip />
      <SideNav name={name} tagline={tagline} />
      <Cursor />
      <KeyboardNav />

      {/* Page content */}
      <div className="main">{children}</div>
    </>
  );
}
