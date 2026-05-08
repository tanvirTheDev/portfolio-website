import Link from "next/link";
import type { MediumPost } from "@/lib/medium";

interface Props {
  posts: MediumPost[];
}

export default function LatestPosts({ posts }: Props) {
  if (!posts || posts.length === 0) return null;
  const latest = posts.slice(0, 3);

  return (
    <section className="latest-posts-section">
      <div className="lp-hdr">
        <div>
          <span className="slabel" style={{ margin: 0 }}>
            LATEST WRITING
          </span>
          <h2 className="lp-title">FROM THE BLOG</h2>
        </div>
        <Link href="/blog" className="btn lp-all-btn">
          ALL POSTS →
        </Link>
      </div>

      <div className="lp-list">
        {latest.map((post, i) => {
          const date = post.pubDate
            ? new Date(post.pubDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : null;

          return (
            <a
              key={post.link}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-row"
            >
              <span className="lp-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="lp-body">
                {date && <span className="lp-date">{date}</span>}
                <span className="lp-post-title">{post.title}</span>
                {post.tags?.length > 0 && (
                  <div className="lp-cats">
                    {post.tags.slice(0, 3).map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="lp-arrow">↗</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
