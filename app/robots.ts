import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      // Standard search engines
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // OpenAI / ChatGPT crawler
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // OpenAI content browser plugin
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // Anthropic / Claude crawler
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // Perplexity AI crawler
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // Google Gemini / Bard crawler
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // Common.Crawl (used by many AI training datasets)
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // Meta AI / Llama training crawler
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
      // Cohere AI crawler
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: ["/studio/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
