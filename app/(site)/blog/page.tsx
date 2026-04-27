import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/queries";
import { getMediumPosts } from "@/lib/medium";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const settings = await getSiteSettings().catch(() => null);
  const posts = await getMediumPosts(settings?.mediumUsername ?? "").catch(() => []);

  return (
    <div>
      {/* ── PHYSICS STAGE ── */}
      <KineticTitleLoader text="WRITING" label="005 / BLOG" />

      {/* ── BLOG CONTENT ── */}
      <div className="page" style={{ paddingTop: 48 }}>
        {posts.length === 0 ? (
          <div className="blog-error">
            <span style={{ opacity: 0.6 }}>FEED UNAVAILABLE — SET mediumUsername IN STUDIO</span>
          </div>
        ) : (
          <>
            <div className="blog-hdr">{posts.length} POSTS · MEDIUM · SORTED BY DATE</div>

            {posts.map((post, i) => (
              <a
                key={post.link + i}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-row"
                data-reveal=""
              >
                <div className="blog-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="blog-body">
                  <div className="blog-date">{post.pubDate}</div>
                  <div className="blog-title">{post.title}</div>
                  <div className="blog-excerpt">{post.excerpt}</div>
                  <div className="blog-reading">{post.readingTime}</div>
                </div>
              </a>
            ))}
          </>
        )}

        <div className="deco" style={{ marginTop: 40 }}>
          THOUGHTS
        </div>
      </div>
    </div>
  );
}
