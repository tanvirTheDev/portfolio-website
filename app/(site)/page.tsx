import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Index",
};

export default async function HomePage() {
  const settings = await getSiteSettings().catch(() => null);

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <span className="slabel">001 / INDEX</span>
      <h1 className="sec-title" style={{ marginBottom: 40 }}>
        {settings?.name ?? "PORTFOLIO"}
      </h1>
      <p style={{ fontSize: 11, opacity: 0.5, letterSpacing: "0.1em" }}>
        {settings?.tagline ?? "FULL-STACK DEVELOPER"}
      </p>
      {/* Full home page content wired in Phase 4 */}
    </div>
  );
}
