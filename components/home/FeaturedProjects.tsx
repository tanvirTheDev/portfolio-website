import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";

interface Props {
  projects: Project[];
}

export default function FeaturedProjects({ projects }: Props) {
  const featured = projects.slice(0, 3);
  if (!featured.length) return null;

  return (
    <section className="fp-section">
      {/* Header */}
      <div className="fp-hdr">
        <div>
          <span className="slabel" style={{ margin: 0 }}>
            SELECTED WORK
          </span>
          <h2 className="fp-title">FEATURED PROJECTS</h2>
        </div>
        <Link href="/work" className="btn fp-all-btn">
          VIEW ALL WORK →
        </Link>
      </div>

      {/* Cards grid */}
      <div className="fp-grid">
        {featured.map((p, i) => {
          const thumbUrl = p.thumbnail ? urlFor(p.thumbnail).width(640).height(360).url() : null;

          return (
            <Link href={`/work/${p.slug}`} key={p._id} className="fp-card">
              {/* Thumbnail */}
              <div className="fp-card-img">
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={p.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="fp-card-no-img">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                )}
                <div className="fp-card-overlay" />
                {p.status && <span className="fp-card-status">{p.status}</span>}
              </div>

              {/* Body */}
              <div className="fp-card-body">
                <span className="fp-card-idx">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="fp-card-title">{p.title}</h3>
                {p.tagline && <p className="fp-card-tagline">{p.tagline}</p>}

                {p.stack && p.stack.length > 0 && (
                  <div className="fp-card-tags">
                    {p.stack.slice(0, 3).map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                    {p.stack.length > 3 && <span className="tag">+{p.stack.length - 3}</span>}
                  </div>
                )}

                <div className="fp-card-footer">
                  <span className="fp-card-year">{p.year ?? "—"}</span>
                  <span className="fp-card-cta">VIEW PROJECT ↗</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
