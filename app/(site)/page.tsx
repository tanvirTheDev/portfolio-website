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
import TrackedLink from "@/components/ui/TrackedLink";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  // absolute prevents the layout template from appending "| Tanvir Ahamed" again
  title: {
    absolute: "Tanvir Ahamed — Full-Stack Developer",
  },
  description:
    "Portfolio of Tanvir Ahamed (also known as Tanvir Ahmed, tanvirthedev, Tanvir the Dev) — full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Tanvir Ahamed — Full-Stack Developer",
    description:
      "Portfolio of Tanvir Ahamed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products.",
    type: "website",
    url: SITE_URL,
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

  // JSON-LD Person schema — rich structured data for Google + AI crawlers
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings?.name ?? "Tanvir Ahamed",
    alternateName: ["Tanvir Ahmed", "tanvirthedev", "Tanvir the Dev", "tanvir ahamed developer"],
    url: SITE_URL,
    jobTitle: settings?.tagline ?? "Full-Stack Developer",
    description:
      "Full-stack developer specialising in React, Next.js, Node.js, and TypeScript. Available for freelance work on Upwork. Known as tanvirthedev.",
    ...(settings?.email && { email: `mailto:${settings.email}` }),
    ...(settings?.profileImage?.asset?.url && { image: settings.profileImage.asset.url }),
    sameAs: [
      settings?.githubUrl,
      settings?.linkedinUrl,
      settings?.upworkUrl ?? "https://www.upwork.com/freelancers/tanvirthedev",
      settings?.mediumUsername ? `https://medium.com/@${settings.mediumUsername}` : null,
      settings?.twitterUrl,
      settings?.leetcodeUrl,
      settings?.devCommunityUrl,
    ].filter(Boolean),
  };

  return (
    <div>
      {/* ── JSON-LD structured data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

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

      {/* ── HERO STRIP — photo + role + CTA ── */}
      <div className="home-hero" data-reveal="">
        {/* Profile photo — left side */}
        {settings?.profileImage?.asset?.url && (
          <div className="hero-photo-wrap">
            <div className="hero-photo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.profileImage.asset.url}
                alt={settings.name ?? "Tanvir Ahamed"}
                className="hero-photo"
              />
              <div className="hero-photo-scan" aria-hidden />
            </div>
            {/* Upwork badge under photo */}
            {settings?.upworkUrl && (
              <TrackedLink
                href={settings.upworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="upwork-badge"
                eventName="upwork_profile_click"
                eventLabel="Hero — Upwork badge"
                eventCategory="Engagement"
              >
                <span className="upwork-dot" aria-hidden />
                <span className="upwork-label">UPWORK</span>
                {settings.upworkJss != null && (
                  <span className="upwork-jss">{settings.upworkJss}% JSS</span>
                )}
                {settings.upworkJobsCompleted != null && (
                  <span className="upwork-jobs">{settings.upworkJobsCompleted} JOBS</span>
                )}
              </TrackedLink>
            )}
          </div>
        )}

        <div className="home-hero__text">
          <p className="home-hero__role">
            {settings?.tagline ?? "FULL-STACK DEVELOPER · REACT · NODE.JS · TYPESCRIPT"}
          </p>
          {settings?.resumeFile?.asset?.url && (
            <TrackedLink
              href={settings.resumeFile.asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="home-hero__resume"
              eventName="resume_download"
              eventLabel="Hero — Download Résumé"
              eventCategory="Engagement"
            >
              ↓ DOWNLOAD RÉSUMÉ
            </TrackedLink>
          )}
        </div>
        <div className="home-hero__actions">
          <Link href="/work" className="btn btn-solid">
            VIEW WORK
          </Link>
          <Link href="/contact" className="btn">
            GET IN TOUCH
          </Link>
          {videoId && (
            <TrackedLink
              href="#intro-video"
              className="btn btn-video"
              eventName="intro_video_click"
              eventLabel="Hero — Watch Intro button"
              eventCategory="Engagement"
            >
              ▶ WATCH INTRO · 90s
            </TrackedLink>
          )}
        </div>
      </div>

      {/* ── INTRO VIDEO — opt-in section below hero ── */}
      {videoId && (
        <div className="intro-video-wrap" id="intro-video" data-reveal="">
          <div className="intro-video-label">
            <span className="slabel">INTRO.VIDEO</span>
            <span className="intro-video-meta">
              WHO IS {(settings?.name ?? "TANVIR").toUpperCase()} · 1:30
            </span>
          </div>
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
