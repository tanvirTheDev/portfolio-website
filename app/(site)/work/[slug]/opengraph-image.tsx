import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/sanity/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamic OG image for each project — title, tagline, status badge, stack. */
export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);

  if (!project) {
    return new ImageResponse(
      <div style={{ background: "#0A0A0A", width: "100%", height: "100%", display: "flex" }} />,
      { ...size }
    );
  }

  const stackLine = (project.stack ?? []).slice(0, 5).join("  ·  ");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0A0A0A",
        padding: "72px 80px",
        position: "relative",
        fontFamily: "monospace",
      }}
    >
      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(34,34,34,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(34,34,34,0.9) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          display: "flex",
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "#E8FF00",
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
          height: "100%",
        }}
      >
        {/* Label row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <span
            style={{
              fontSize: 12,
              letterSpacing: "0.4em",
              color: "#E8FF00",
              opacity: 0.8,
              display: "flex",
            }}
          >
            WORK / PROJECT
          </span>

          {/* Status badge */}
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "#E8FF00",
              border: "1px solid #E8FF00",
              padding: "2px 10px",
              display: "flex",
              opacity: 0.7,
            }}
          >
            {project.status}
          </span>

          {project.year && (
            <span
              style={{
                fontSize: 12,
                color: "#F2F0E9",
                opacity: 0.25,
                letterSpacing: "0.1em",
                display: "flex",
              }}
            >
              {project.year}
            </span>
          )}
        </div>

        {/* Project title */}
        <div
          style={{
            fontSize: project.title.length > 12 ? 80 : 100,
            fontWeight: 800,
            color: "#F2F0E9",
            textTransform: "uppercase",
            letterSpacing: "-0.025em",
            lineHeight: 0.88,
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {project.title.toUpperCase()}
        </div>

        {/* Bottom: tagline + stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {project.tagline && (
            <div
              style={{
                fontSize: 17,
                color: "#F2F0E9",
                opacity: 0.42,
                letterSpacing: "0.04em",
                display: "flex",
              }}
            >
              {project.tagline}
            </div>
          )}
          {stackLine && (
            <div
              style={{
                fontSize: 13,
                color: "#F2F0E9",
                opacity: 0.2,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {stackLine}
            </div>
          )}
        </div>
      </div>
    </div>,
    { ...size }
  );
}
