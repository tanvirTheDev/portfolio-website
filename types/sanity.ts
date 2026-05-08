import type { PortableTextBlock } from "sanity";

// ── Shared ────────────────────────────────────────────────────────────────────

export type SanitySlug = { current: string };

export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
};

// ── Project ───────────────────────────────────────────────────────────────────

export type ProjectStatus = "SHIPPED" | "OPEN SOURCE" | "BETA" | "ARCHIVED";

export type Project = {
  _id: string;
  _type: "project";
  title: string;
  slug: string; // GROQ returns slug.current as a plain string
  tagline?: string;
  status: ProjectStatus;
  year?: string;
  order?: number;
  publishedAt?: string;
  thumbnail?: SanityImage;
  youtubeId?: string;
  liveUrl?: string;
  githubUrl?: string;
  stack?: string[];
  features?: string[];
  problem?: PortableTextBlock[];
  challenges?: PortableTextBlock[];
  architecture?: PortableTextBlock[];
};

// ── Experience ────────────────────────────────────────────────────────────────

export type Experience = {
  _id: string;
  _type: "experience";
  company: string;
  title: string;
  dateStart: string;
  dateEnd?: string;
  location?: string;
  order?: number;
  bullets?: string[];
  stack?: string[];
};

// ── Certificate ───────────────────────────────────────────────────────────────

export type Certificate = {
  _id: string;
  _type: "certificate";
  name: string;
  issuer: string;
  date?: string;
  credentialId: string;
  verifyUrl?: string;
  image?: SanityImage;
  order?: number;
};

// ── Site Settings ─────────────────────────────────────────────────────────────

export type Availability = {
  available?: boolean;
  label?: string;
};

// ── Leaderboard Score ─────────────────────────────────────────────────────────

export type ScoreEntry = {
  _id: string;
  playerName: string;
  score: number;
  stageReached: number;
  createdAt: string;
};

// ── Site Settings ─────────────────────────────────────────────────────────────

export type SiteSettings = {
  _id: string;
  _type: "siteSettings";
  name: string;
  tagline?: string;
  email?: string;
  availability?: Availability;
  profileImage?: { asset: { url: string } };
  upworkJss?: number;
  upworkJobsCompleted?: number;
  introVideoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  upworkUrl?: string;
  mediumUsername?: string;
  // Social & Platforms
  twitterUrl?: string;
  facebookUrl?: string;
  facebookPageUrl?: string;
  leetcodeUrl?: string;
  codeforcesUrl?: string;
  devCommunityUrl?: string;
  resumeFile?: { asset: { url: string } };
};
