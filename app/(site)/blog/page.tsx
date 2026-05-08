import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/queries";
import { getMediumPosts } from "@/lib/medium";
import type { MediumPost } from "@/lib/medium";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical articles on full-stack development, React, Next.js, Node.js, and system design.",
  keywords: ["blog", "technical writing", "React", "Next.js", "Node.js", "system design"],
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog — Tanvir Ahamed",
    description:
      "Technical articles on full-stack development, React, Next.js, Node.js, and system design.",
    type: "website",
    url: `${SITE_URL}/blog`,
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="blog-tags">
      {tags.map((t) => (
        <span key={t} className="blog-tag">
          {t}
        </span>
      ))}
    </div>
  );
}

function FeaturedPost({ post }: { post: MediumPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="blog-featured"
      data-reveal=""
    >
      {/* Thumbnail */}
      <div className="blog-feat-img">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt={post.title} loading="lazy" />
        ) : (
          <div className="blog-feat-img--placeholder">NO IMAGE</div>
        )}
      </div>

      {/* Body */}
      <div className="blog-feat-body">
        <span className="blog-feat-label">FEATURED · LATEST</span>
        <div className="blog-date">{post.pubDate}</div>
        <div className="blog-feat-title">{post.title}</div>
        <div className="blog-feat-excerpt">{post.excerpt}</div>
        <TagList tags={post.tags} />
        <div className="blog-reading">{post.readingTime}</div>
      </div>
    </a>
  );
}

function PostCard({ post }: { post: MediumPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="blog-card"
      data-reveal=""
    >
      <div className="blog-card-img">
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt={post.title} loading="lazy" />
        ) : (
          <div className="blog-card-img--placeholder">NO IMAGE</div>
        )}
      </div>
      <div className="blog-card-body">
        <div className="blog-card-date">{post.pubDate}</div>
        <div className="blog-card-title">{post.title}</div>
        <div className="blog-card-excerpt">{post.excerpt}</div>
        <div className="blog-card-footer">
          <TagList tags={post.tags} />
          <span className="blog-card-time">{post.readingTime}</span>
        </div>
      </div>
    </a>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function BlogPage() {
  const settings = await getSiteSettings().catch(() => null);
  const posts = await getMediumPosts(settings?.mediumUsername ?? "").catch(() => []);

  return (
    <div>
      <KineticTitleLoader text="WRITING" label="005 / BLOG" />

      <div className="page" style={{ paddingTop: 40 }}>
        {posts.length === 0 ? (
          <div className="blog-error">
            <span style={{ opacity: 0.6 }}>FEED UNAVAILABLE — SET mediumUsername IN STUDIO</span>
          </div>
        ) : (
          <>
            <div className="blog-hdr">{posts.length} POSTS · MEDIUM · SORTED BY DATE</div>

            {/* Featured — first post */}
            <FeaturedPost post={posts[0]} />

            {/* Card grid — remaining posts */}
            {posts.length > 1 && (
              <div className="blog-cards">
                {posts.slice(1).map((post) => (
                  <PostCard key={post.link} post={post} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="deco" style={{ marginTop: 40 }}>
          THOUGHTS
        </div>
      </div>
    </div>
  );
}
