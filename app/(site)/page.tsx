import type { Metadata } from "next";
import Link from "next/link";
import {
  getSiteSettings,
  getAllProjects,
  getAllExperience,
  getAllCertificates,
} from "@/lib/sanity/queries";
import { getMediumPosts } from "@/lib/medium";
import BuildStamp from "@/components/ui/BuildStamp";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

export const metadata: Metadata = {
  title: "Tanvir Ahmed — Full-Stack Developer",
  description:
    "Portfolio of Tanvir Ahmed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
  openGraph: {
    title: "Tanvir Ahmed — Full-Stack Developer",
    description:
      "Portfolio of Tanvir Ahmed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
    type: "website",
  },
};

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

export default async function HomePage() {
  const [settings, projects, experience, certs] = await Promise.all([
    getSiteSettings().catch(() => null),
    getAllProjects().catch(() => []),
    getAllExperience().catch(() => []),
    getAllCertificates().catch(() => []),
  ]);

  // Fetch blog count only when username is configured (cached anyway)
  const blogPosts = settings?.mediumUsername
    ? await getMediumPosts(settings.mediumUsername).catch(() => [])
    : [];
  const blogCount = blogPosts.length;

  const availability = settings?.availability;
  const videoId = settings?.introVideoUrl ? getYouTubeId(settings.introVideoUrl) : null;
  const isAvailable = availability?.available ?? false;
  const availLabel =
    availability?.label?.trim() || (isAvailable ? "AVAILABLE FOR WORK" : "CURRENTLY ENGAGED");

  const DIR_PAGES = [
    {
      href: "/work",
      label: "WORK",
      idx: "002",
      entries: `${projects.length} entries`,
      type: "PROJECTS",
      desc: "Full-stack builds",
    },
    {
      href: "/experience",
      label: "EXPERIENCE",
      idx: "003",
      entries: experience.length ? `${experience.length} entries` : "—",
      type: "TIMELINE",
      desc: "Work history",
    },
    {
      href: "/certificates",
      label: "CERTIFICATES",
      idx: "004",
      entries: certs.length ? `${certs.length} entries` : "—",
      type: "CREDENTIALS",
      desc: "Verified certs",
    },
    {
      href: "/blog",
      label: "BLOG",
      idx: "005",
      entries: blogCount ? `${blogCount} entries` : "—",
      type: "WRITING",
      desc: "Technical posts",
    },
    {
      href: "/contact",
      label: "CONTACT",
      idx: "006",
      entries: "—",
      type: "CONTACT",
      desc: "Get in touch",
    },
    {
      href: "/play",
      label: "PLAY",
      idx: "007",
      entries: "1 entry",
      type: "GAME",
      desc: "Sky Shooter",
    },
  ] as const;

  return (
    <div>
      {/* ── PHYSICS STAGE ── */}
      <KineticTitleLoader text={settings?.name ?? "PORTFOLIO"} />

      {/* ── AVAILABILITY BADGE ── */}
      {availability && (
        <div className="avail-wrap" data-reveal="">
          <Link href="/contact" style={{ textDecoration: "none" }}>
            <span className="avail-badge" data-available={isAvailable ? "true" : "false"}>
              <span className="avail-dot" aria-hidden />
              <span>STATUS · {availLabel}</span>
            </span>
          </Link>
        </div>
      )}

      {/* ── HERO STRIP — role + CTA ── */}
      <div className="home-hero" data-reveal="">
        <div className="home-hero__text">
          <p className="home-hero__role">
            {settings?.tagline ?? "FULL-STACK DEVELOPER · REACT · NODE.JS · TYPESCRIPT"}
          </p>
          {settings?.resumeFile?.asset?.url && (
            <a
              href={settings.resumeFile.asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="home-hero__resume"
            >
              ↓ DOWNLOAD RÉSUMÉ
            </a>
          )}
        </div>
        <div className="home-hero__actions">
          <Link href="/work" className="btn btn-solid">
            VIEW WORK
          </Link>
          <Link href="/contact" className="btn">
            GET IN TOUCH
          </Link>
        </div>
      </div>

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

      {DIR_PAGES.map(({ href, label, idx, entries, type, desc }) => (
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
          <span className="ds">{entries}</span>
          <span className="ds">{type}</span>
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
