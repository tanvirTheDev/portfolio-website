import type { Metadata } from "next";
import {
  getSiteSettings,
  getAllProjects,
  getFeaturedTestimonials,
  getAllServices,
} from "@/lib/sanity/queries";
import { getMediumPosts } from "@/lib/medium";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";
import HeroStatus from "@/components/home/HeroStatus";
import BroadcastFrame from "@/components/home/BroadcastFrame";
import SkillsTicker from "@/components/home/SkillsTicker";
import ServicesSection from "@/components/home/ServicesSection";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import LatestPosts from "@/components/home/LatestPosts";
import CTAStrip from "@/components/home/CTAStrip";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    absolute: "Tanvir Ahamed — Full-Stack Developer",
  },
  description:
    "Portfolio of Tanvir Ahamed — full-stack developer specialising in React, Next.js, Node.js, and scalable web products. Known online as tanvirthedev.",
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
  const [settings, projects, testimonials, services] = await Promise.all([
    getSiteSettings().catch(() => null),
    getAllProjects().catch(() => []),
    getFeaturedTestimonials().catch(() => []),
    getAllServices().catch(() => []),
  ]);

  const blogPosts = settings?.mediumUsername
    ? await getMediumPosts(settings.mediumUsername).catch(() => [])
    : [];

  const availability = settings?.availability;
  const videoId = settings?.introVideoUrl ? getYouTubeId(settings.introVideoUrl) : null;
  const isAvailable = availability?.available ?? false;
  const availLabel =
    availability?.label?.trim() || (isAvailable ? "AVAILABLE FOR WORK" : "CURRENTLY ENGAGED");
  const upworkSuccess = settings?.upworkJss != null ? `${settings.upworkJss}%` : undefined;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings?.name ?? "Tanvir Ahamed",
    alternateName: ["tanvirthedev", "Tanvir the Dev", "tanvir ahamed developer"],
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
        resumeUrl={settings?.resumeFile?.asset?.url}
      />

      {/* ── SKILLS TICKER ── */}
      <SkillsTicker skills={settings?.skills} />

      {/* ── SERVICES ── */}
      <ServicesSection services={services} />

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection testimonials={testimonials} />

      {/* ── FEATURED PROJECTS ── */}
      <FeaturedProjects projects={projects} />

      {/* ── LATEST BLOG POSTS ── */}
      <LatestPosts posts={blogPosts} />

      {/* ── CTA STRIP ── */}
      <CTAStrip
        isAvailable={isAvailable}
        availableText={availLabel}
        upworkUrl={settings?.upworkUrl ?? "https://www.upwork.com/freelancers/tanvirthedev"}
        resumeUrl={settings?.resumeFile?.asset?.url}
      />
    </div>
  );
}
