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
import HeroStatus from "@/components/home/HeroStatus";
import BroadcastFrame from "@/components/home/BroadcastFrame";
import SkillsTicker from "@/components/home/SkillsTicker";

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

  // Fetch blog count only when username is configured
  const blogPosts = settings?.mediumUsername
    ? await getMediumPosts(settings.mediumUsername).catch(() => [])
    : [];
  const blogCount = blogPosts.length;

  const availability = settings?.availability;
  const videoId = settings?.introVideoUrl ? getYouTubeId(settings.introVideoUrl) : null;
  const isAvailable = availability?.available ?? false;
  const availLabel =
    availability?.label?.trim() || (isAvailable ? "AVAILABLE FOR WORK" : "CURRENTLY ENGAGED");

  // Upwork stats
  const upworkSuccess = settings?.upworkJss != null ? `${settings.upworkJss}%` : undefined;

  const DIR_PAGES = [
    {
      href: "/work",
      label: "WORK",
      idx: "002",
      desc: `${projects.length} ENTRIES`,
    },
    {
      href: "/experience",
      label: "EXPERIENCE",
      idx: "003",
      desc: experience.length ? `${experience.length} ROLES` : "—",
    },
    {
      href: "/certificates",
      label: "CERTIFICATES",
      idx: "004",
      desc: certs.length ? `${certs.length} CREDENTIALS` : "—",
    },
    {
      href: "/blog",
      label: "BLOG",
      idx: "005",
      desc: blogCount ? `${blogCount} POSTS` : "LIVE RSS FEED",
    },
    {
      href: "/contact",
      label: "CONTACT",
      idx: "006",
      desc: "ENCRYPTED CHANNEL",
    },
    {
      href: "/about",
      label: "ABOUT",
      idx: "007",
      desc: "1 ENTRY",
    },
    {
      href: "/play",
      label: "PLAY",
      idx: "008",
      desc: "SKY SHOOTER",
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
    <div className="home-v2">
      {/* ── JSON-LD structured data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      {/* ── PHYSICS TITLE ── */}
      <KineticTitleLoader text={settings?.name ?? "PORTFOLIO"} />

      {/* ── HERO STATUS BAR ── */}
      <HeroStatus
        availableText={availLabel}
        isAvailable={isAvailable}
        role={settings?.tagline ?? "FULL-STACK DEVELOPER"}
        resumeUrl={settings?.resumeFile?.asset?.url}
      />

      {/* ── BROADCAST FRAME ── */}
      <BroadcastFrame
        transmissionId={settings?.introMeta?.transmissionId ?? "TX-0001"}
        channel={settings?.introMeta?.channel ?? "TANVIR_DEV"}
        duration={settings?.introMeta?.duration ?? "01:30"}
        recordedAt={settings?.introMeta?.recordedAt}
        location={settings?.introMeta?.location ?? "REMOTE / DHAKA"}
        youtubeId={videoId ?? undefined}
        videoTitle={
          settings?.introMeta?.title ??
          `WHO IS ${(settings?.name ?? "TANVIR AHAMED").toUpperCase()}`
        }
        profileImageUrl={settings?.profileImage?.asset?.url}
        name={settings?.name ?? "TANVIR AHAMED"}
        role={settings?.tagline ?? "FULL-STACK DEVELOPER"}
        upworkSuccess={upworkSuccess}
        upworkJobs={settings?.upworkJobsCompleted}
        upworkEarnings={settings?.upworkEarnings}
      />

      {/* ── SKILLS TICKER ── */}
      <SkillsTicker skills={settings?.skills} />

      {/* ── DIRECTORY SECTION ── */}
      <div className="dir-section">
        <div className="dir-section-hdr">
          <div>
            <span className="slabel" style={{ margin: 0 }}>
              01 / DIRECTORY
            </span>
            <div className="dir-section-title">PORTFOLIO_INDEX</div>
          </div>
          <div className="dir-section-meta">
            v1.0.0 · CHK_7F3A9C
            <br />
            COMPILED — <BuildStamp />
            <br />
            OWNER {settings?.email ?? "tanvir@portfolio.dev"}
          </div>
        </div>

        <div className="dir-head">
          <span>IDX</span>
          <span>PATH</span>
          <span>SIZE</span>
          <span>NOTES</span>
          <span>→</span>
        </div>

        {DIR_PAGES.map(({ href, label, idx, desc }) => (
          <Link
            key={href}
            href={href}
            className="dir-row"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span className="di">{idx}</span>
            <span className="dn">/{label}</span>
            <span className="ds">—</span>
            <span className="dd">{desc}</span>
            <span
              className="ds"
              style={{ textAlign: "right", color: "var(--accent)", opacity: 0.7 }}
            >
              ↗
            </span>
          </Link>
        ))}
      </div>

      {/* Decorative overflow text */}
      <div className="deco" style={{ marginTop: 0, padding: "0 48px", overflow: "hidden" }}>
        {settings?.tagline ?? "FULL-STACK DEVELOPER"}
      </div>
    </div>
  );
}
