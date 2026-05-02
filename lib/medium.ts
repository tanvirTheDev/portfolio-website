import { XMLParser } from "fast-xml-parser";
import { cacheLife } from "next/cache";

export type MediumPost = {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
  readingTime: string;
  thumbnail: string | null;
  tags: string[];
};

// Shown when the RSS fetch fails
const FALLBACK_POSTS: MediumPost[] = [
  {
    title: "Building Deterministic Physics at Scale",
    link: "https://medium.com",
    pubDate: "2025-11-01",
    excerpt:
      "How we achieved sub-10ms p95 latency with fully deterministic physics across 4 000 concurrent sessions — and why floating-point was the enemy.",
    readingTime: "12 min read",
    thumbnail: null,
    tags: ["Performance", "Engineering"],
  },
  {
    title: "CLI-First: Why Your Tool Doesn't Need a Dashboard",
    link: "https://medium.com",
    pubDate: "2025-08-15",
    excerpt:
      "A dashboard is a hypothesis about what your users need. A CLI is a commitment to what they actually do. Building Coldline taught me the difference.",
    readingTime: "8 min read",
    thumbnail: null,
    tags: ["DevTools", "UX"],
  },
  {
    title: "Isolation Forests in Production: Lessons from Threshold",
    link: "https://medium.com",
    pubDate: "2025-06-20",
    excerpt:
      "Shipping an ML anomaly detection system as a single binary — cold-start problems, model updates without downtime, and what we got wrong first.",
    readingTime: "15 min read",
    thumbnail: null,
    tags: ["Machine Learning", "Production"],
  },
  {
    title: "Zero-Copy Allocators in Rust: A Practical Guide",
    link: "https://medium.com",
    pubDate: "2025-03-10",
    excerpt:
      "Getting to zero GC pauses on the hot path required rewriting our allocator. Here's what we learned, what we stole from jemalloc, and what we invented.",
    readingTime: "18 min read",
    thumbnail: null,
    tags: ["Rust", "Systems"],
  },
];

function estimateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return `${mins} min read`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull the first <img src="..."> out of raw HTML */
function extractThumbnail(html: string): string | null {
  const m = html.match(/<img[^>]+src="([^"]+)"/);
  return m ? m[1] : null;
}

/** Parse RSS <category> into a tag array (max 4) */
function extractTags(raw: Record<string, unknown>): string[] {
  const cat = raw.category;
  if (!cat) return [];
  if (Array.isArray(cat)) return cat.map(String).slice(0, 4);
  return [String(cat)];
}

export async function getMediumPosts(username: string): Promise<MediumPost[]> {
  "use cache";
  cacheLife("hours");

  function extractUsername(input: string): string {
    if (!input) return "";
    if (input.includes("medium.com")) {
      const match = input.match(/@([^/?]+)/);
      return match ? match[1] : "";
    }
    return input.replace("@", "").trim();
  }

  if (!username) return FALLBACK_POSTS;

  try {
    const cleanUsername = extractUsername(username);

    const res = await fetch(`https://medium.com/feed/@${cleanUsername}`, {
      headers: { "User-Agent": "portfolio-rss-reader/1.0" },
    });

    if (!res.ok) return FALLBACK_POSTS;

    const xml = await res.text();

    const parser = new XMLParser({ ignoreAttributes: false, parseAttributeValue: true });
    const feed = parser.parse(xml);
    const items: unknown[] = feed?.rss?.channel?.item ?? [];

    const posts: MediumPost[] = (Array.isArray(items) ? items : [items]).slice(0, 8).map((item) => {
      const raw = item as Record<string, unknown>;
      const content: string = String(raw["content:encoded"] ?? raw.description ?? "");
      const excerpt = stripHtml(content).slice(0, 220).trim() + "…";
      return {
        title: stripHtml(String(raw.title ?? "")),
        link: String(raw.link ?? raw.guid ?? "https://medium.com"),
        pubDate: raw.pubDate
          ? new Date(String(raw.pubDate)).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        excerpt,
        readingTime: estimateReadingTime(stripHtml(content)),
        thumbnail: extractThumbnail(content),
        tags: extractTags(raw),
      };
    });

    return posts.length > 0 ? posts : FALLBACK_POSTS;
  } catch {
    return FALLBACK_POSTS;
  }
}
