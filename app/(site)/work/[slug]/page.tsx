import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs, getProjectNav } from "@/lib/sanity/queries";
import PortableText from "@/components/ui/PortableText";

/**
 * Extract an 11-char YouTube video ID from any of:
 *   - bare ID:              dQw4w9WgXcQ
 *   - watch URL:            https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   - short URL:            https://youtu.be/dQw4w9WgXcQ
 *   - embed URL:            https://www.youtube.com/embed/dQw4w9WgXcQ
 */
function extractYouTubeId(raw: string): string | null {
  if (!raw) return null;
  // Already a bare ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw.trim())) return raw.trim();
  // watch?v=
  const watch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];
  // youtu.be/
  const short = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  // embed/
  const embed = raw.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];
  return null;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${SITE_URL}/work/${slug}`;
  return {
    title: project.title,
    description: project.tagline ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: project.title,
      description: project.tagline ?? undefined,
      url,
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project, navList] = await Promise.all([getProjectBySlug(slug), getProjectNav()]);

  if (!project) notFound();

  const videoId = project.youtubeId ? extractYouTubeId(project.youtubeId) : null;
  const idx = navList.findIndex((n) => n.slug === slug);
  const prev = idx > 0 ? navList[idx - 1] : null;
  const next = idx < navList.length - 1 ? navList[idx + 1] : null;

  return (
    <div className="page" style={{ paddingTop: 0, maxWidth: 900 }}>
      {/* Back */}
      <Link href="/work" className="proj-back">
        ← WORK / SPECIMEN ARCHIVE
      </Link>

      {/* Header */}
      <div className="proj-name" data-reveal="">
        {project.title}
      </div>
      {project.tagline && (
        <div className="proj-tagline" data-reveal="">
          {project.tagline}
        </div>
      )}

      {/* Stack tags */}
      {project.stack?.length && (
        <div className="stack-row">
          {project.stack.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
          {project.year && (
            <span
              className="tag"
              style={{ color: "var(--accent)", borderColor: "var(--accent)", opacity: 0.7 }}
            >
              {project.year}
            </span>
          )}
          <span className="tag">{project.status}</span>
        </div>
      )}

      {/* YouTube embed */}
      {videoId && (
        <div className="video-wrap" data-reveal="">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={`${project.title} demo`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="action-btns">
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
          >
            LIVE SITE ↗
          </a>
        ) : (
          <span className="action-btn off">LIVE SITE</span>
        )}
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
          >
            GITHUB ↗
          </a>
        ) : (
          <span className="action-btn off">GITHUB</span>
        )}
      </div>

      {/* Problem */}
      {project.problem?.length ? (
        <div className="proj-sec" data-reveal="">
          <span className="proj-sec-label">THE PROBLEM</span>
          <PortableText value={project.problem} className="proj-body" />
        </div>
      ) : null}

      {/* Features */}
      {project.features?.length ? (
        <div className="proj-sec" data-reveal="">
          <span className="proj-sec-label">KEY FEATURES</span>
          <ul className="features">
            {project.features.map((f, i) => (
              <li key={i}>
                <span className="feat-n">{String(i + 1).padStart(2, "0")}</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Challenges */}
      {project.challenges?.length ? (
        <div className="proj-sec" data-reveal="">
          <span className="proj-sec-label">CHALLENGES</span>
          <PortableText value={project.challenges} className="proj-body" />
        </div>
      ) : null}

      {/* Architecture */}
      {project.architecture?.length ? (
        <div className="proj-sec" data-reveal="">
          <span className="proj-sec-label">ARCHITECTURE</span>
          <PortableText value={project.architecture} className="arch-box" />
        </div>
      ) : null}

      {/* Prev / Next navigation */}
      <div className="proj-nav-row">
        {prev ? (
          <Link href={`/work/${prev.slug}`} className="pnav-btn">
            ← {prev.title}
          </Link>
        ) : (
          <button className="pnav-btn" disabled>
            ← PREV
          </button>
        )}
        {next ? (
          <Link href={`/work/${next.slug}`} className="pnav-btn">
            {next.title} →
          </Link>
        ) : (
          <button className="pnav-btn" disabled>
            NEXT →
          </button>
        )}
      </div>
    </div>
  );
}
