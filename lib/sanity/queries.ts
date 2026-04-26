import { groq } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import type { Certificate, Experience, Project, SiteSettings } from "@/types/sanity";
import { client } from "./client";

// ── Fragments ─────────────────────────────────────────────────────────────────

const projectFields = groq`
  _id, _type,
  title,
  "slug": slug.current,
  tagline, status, year, order, publishedAt,
  thumbnail,
  youtubeId, liveUrl, githubUrl,
  stack, features,
  problem, challenges, architecture
`;

// ── Site Settings ─────────────────────────────────────────────────────────────

const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    _id, _type,
    name, tagline, email,
    githubUrl, linkedinUrl, mediumUsername,
    resumeFile { asset -> { url } }
  }
`;

export async function getSiteSettings(): Promise<SiteSettings | null> {
  "use cache";
  cacheLife("days");
  cacheTag("siteSettings");
  return client.fetch(SITE_SETTINGS_QUERY);
}

// ── Projects ──────────────────────────────────────────────────────────────────

const ALL_PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc, publishedAt desc) {
    ${projectFields}
  }
`;

export async function getAllProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("project");
  return client.fetch(ALL_PROJECTS_QUERY);
}

const PROJECT_BY_SLUG_QUERY = groq`
  *[_type == "project" && slug.current == $slug][0] {
    ${projectFields}
  }
`;

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("project", `project:${slug}`);
  return client.fetch(PROJECT_BY_SLUG_QUERY, { slug });
}

const PROJECT_SLUGS_QUERY = groq`
  *[_type == "project" && defined(slug.current)] { "slug": slug.current }
`;

export async function getAllProjectSlugs(): Promise<{ slug: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("project");
  return client.fetch(PROJECT_SLUGS_QUERY);
}

const PROJECT_NAV_QUERY = groq`
  *[_type == "project"] | order(order asc, publishedAt desc) {
    "slug": slug.current,
    title
  }
`;

export async function getProjectNav(): Promise<{ slug: string; title: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("project");
  return client.fetch(PROJECT_NAV_QUERY);
}

// ── Experience ────────────────────────────────────────────────────────────────

const ALL_EXPERIENCE_QUERY = groq`
  *[_type == "experience"] | order(order asc) {
    _id, _type,
    company, title, dateStart, dateEnd, location, order, bullets, stack
  }
`;

export async function getAllExperience(): Promise<Experience[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("experience");
  return client.fetch(ALL_EXPERIENCE_QUERY);
}

// ── Certificates ──────────────────────────────────────────────────────────────

const ALL_CERTIFICATES_QUERY = groq`
  *[_type == "certificate"] | order(order asc, date desc) {
    _id, _type,
    name, issuer, date, credentialId, verifyUrl, image, order
  }
`;

export async function getAllCertificates(): Promise<Certificate[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("certificate");
  return client.fetch(ALL_CERTIFICATES_QUERY);
}
