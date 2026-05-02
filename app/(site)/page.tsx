import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings, getAllProjects } from "@/lib/sanity/queries";
import BuildStamp from "@/components/ui/BuildStamp";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

export const metadata: Metadata = { title: "Index" };

/** Extract YouTube video ID from any common URL format */
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      return u.searchParams.get("v");
    }
  } catch {}
  return null;
}

const DIR_PAGES = [
  { href: "/work", label: "WORK", idx: "002", desc: "Projects" },
  { href: "/experience", label: "EXPERIENCE", idx: "003", desc: "Timeline" },
  { href: "/certificates", label: "CERTIFICATES", idx: "004", desc: "Credentials" },
  { href: "/blog", label: "BLOG", idx: "005", desc: "Writing" },
  { href: "/contact", label: "CONTACT", idx: "006", desc: "Get in touch" },
] as const;

export default async function HomePage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings().catch(() => null),
    getAllProjects().catch(() => []),
  ]);

  const availability = settings?.availability;
  const videoId = settings?.introVideoUrl ? getYouTubeId(settings.introVideoUrl) : null;
  const isAvailable = availability?.available ?? false;
  const availLabel =
    availability?.label?.trim() || (isAvailable ? "AVAILABLE FOR WORK" : "CURRENTLY ENGAGED");

  return (
    <div>
      {/* ── PHYSICS STAGE ── */}
      <KineticTitleLoader text={settings?.name ?? "PORTFOLIO"} />

      {/* ── AVAILABILITY BADGE ── */}
      {availability && (
        <div className="avail-wrap" data-reveal="">
          <span className="avail-badge" data-available={isAvailable ? "true" : "false"}>
            <span className="avail-dot" aria-hidden />
            <span>STATUS · {availLabel}</span>
          </span>
        </div>
      )}

      {/* ── INTRO VIDEO — only renders when Sanity URL is set ── */}
      {videoId && (
        <div className="intro-video-wrap" data-reveal="">
          <span className="slabel">INTRO.VIDEO</span>
          <div className="video-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={`${settings?.name ?? "Developer"} — intro video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* ── DIRECTORY LISTING ── */}
      <div className="manifest-hdr" data-reveal="">
        PORTFOLIO.MANIFEST &nbsp;·&nbsp;{" "}
        <em style={{ color: "var(--accent)", fontStyle: "normal" }}>v1.0.0</em>
        &nbsp;·&nbsp; <BuildStamp />
      </div>

      <div className="dir-head">
        <span>IDX</span>
        <span>PATH</span>
        <span>ENTRIES</span>
        <span>TYPE</span>
        <span>DESC</span>
      </div>

      {/* Work row shows live project count */}
      <Link
        href="/work"
        className="dir-row"
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "grid",
          gridTemplateColumns: "56px 1fr 90px 110px 120px",
          padding: "13px 48px",
          borderBottom: "1px solid var(--border)",
          transition: "background 0.12s",
        }}
      >
        <span className="di">002</span>
        <span className="dn">/WORK</span>
        <span className="ds">{projects.length} entries</span>
        <span className="ds">PROJECTS</span>
        <span className="dd">Full-stack builds</span>
      </Link>

      {DIR_PAGES.slice(1).map(({ href, label, idx, desc }) => (
        <Link
          key={href}
          href={href}
          className="dir-row"
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "grid",
            gridTemplateColumns: "56px 1fr 90px 110px 120px",
            padding: "13px 48px",
            borderBottom: "1px solid var(--border)",
            transition: "background 0.12s",
          }}
        >
          <span className="di">{idx}</span>
          <span className="dn">/{label}</span>
          <span className="ds">—</span>
          <span className="ds">{label}</span>
          <span className="dd">{desc}</span>
        </Link>
      ))}

      {/* Decorative overflow text */}
      <div
        className="deco"
        style={{ position: "relative", marginTop: 0, padding: "0 48px", overflow: "hidden" }}
      >
        {settings?.tagline ?? "FULL-STACK DEVELOPER"}
      </div>
    </div>
  );
}
