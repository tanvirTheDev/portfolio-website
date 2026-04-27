import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/sanity/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default OG image — covers all routes that don't define their own.
 * Renders the site name + tagline on a brutalist dark grid background.
 */
export default async function OGImage() {
  const settings = await getSiteSettings().catch(() => null);
  const name = (settings?.name ?? "PORTFOLIO").toUpperCase();
  const tagline = (settings?.tagline ?? "FULL-STACK DEVELOPER").toUpperCase();

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

      {/* Accent bar — top left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 6,
          height: "100%",
          background: "#E8FF00",
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingLeft: 32,
          zIndex: 1,
          height: "100%",
        }}
      >
        {/* Label */}
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "#E8FF00",
            marginBottom: 48,
            display: "flex",
            opacity: 0.9,
          }}
        >
          001 / INDEX
        </span>

        {/* Name — large */}
        <div
          style={{
            fontSize: name.length > 10 ? 88 : 112,
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
          {name}
        </div>

        {/* Tagline row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 32,
          }}
        >
          <div
            style={{
              width: 32,
              height: 1,
              background: "#E8FF00",
              display: "flex",
              opacity: 0.6,
            }}
          />
          <span
            style={{
              fontSize: 16,
              color: "#F2F0E9",
              opacity: 0.38,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {tagline}
          </span>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
