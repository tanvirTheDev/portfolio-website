import type { MetadataRoute } from "next";
import { getAllProjectSlugs } from "@/lib/sanity/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Fetch project slugs for dynamic routes
  const slugs = await getAllProjectSlugs().catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/work`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/experience`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/certificates`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = slugs.map(({ slug }) => ({
    url: `${base}/work/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes];
}
