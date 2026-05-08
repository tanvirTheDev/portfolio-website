import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/sanity/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const settings = await getSiteSettings().catch(() => null);
  const name = (settings?.name ?? "TANVIR AHAMED").toUpperCase();
  const tagline = (settings?.tagline ?? "FULL-STACK DEVELOPER").toUpperCase();
  const isAvailable = settings?.availability?.available ?? false;
  const photoUrl = settings?.profileImage?.asset?.url;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0A0A0A",
        position: "relative",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(34,34,34,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,34,34,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          display: "flex",
        }}
      />

      {/* Yellow accent bar — left edge */}
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

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          borderBottom: "1px solid #222",
          display: "flex",
          alignItems: "center",
          paddingLeft: 52,
          paddingRight: 48,
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: "0.4em", color: "#E8FF00", display: "flex" }}>
          PORTFOLIO · tanvirthedev
        </span>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "#F2F0E9",
            opacity: 0.3,
            display: "flex",
          }}
        >
          001 / INDEX
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 52,
          paddingRight: 48,
          paddingTop: 72,
          paddingBottom: 48,
          gap: 60,
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Left: text content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
          {/* Availability badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: isAvailable ? "#5fff8f" : "#ff5b5b",
                boxShadow: isAvailable ? "0 0 10px #5fff8f" : "0 0 10px #ff5b5b",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: isAvailable ? "#5fff8f" : "#ff5b5b",
                fontWeight: 700,
                display: "flex",
              }}
            >
              {isAvailable ? "AVAILABLE FOR WORK" : "CURRENTLY ENGAGED"}
            </span>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: name.length > 14 ? 72 : 88,
              fontWeight: 800,
              color: "#F2F0E9",
              letterSpacing: "-0.025em",
              lineHeight: 0.88,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {name}
          </div>

          {/* Divider line */}
          <div
            style={{
              width: 60,
              height: 2,
              background: "#E8FF00",
              display: "flex",
            }}
          />

          {/* Tagline */}
          <span
            style={{
              fontSize: 16,
              color: "#F2F0E9",
              opacity: 0.45,
              letterSpacing: "0.22em",
              display: "flex",
            }}
          >
            {tagline}
          </span>

          {/* Upwork stats row */}
          {(settings?.upworkJss != null || settings?.upworkJobsCompleted != null) && (
            <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
              {settings.upworkJss != null && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span
                    style={{ fontSize: 28, fontWeight: 800, color: "#E8FF00", display: "flex" }}
                  >
                    {settings.upworkJss}%
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.3em",
                      color: "#F2F0E9",
                      opacity: 0.35,
                      display: "flex",
                    }}
                  >
                    JOB SUCCESS
                  </span>
                </div>
              )}
              {settings.upworkJobsCompleted != null && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span
                    style={{ fontSize: 28, fontWeight: 800, color: "#F2F0E9", display: "flex" }}
                  >
                    {settings.upworkJobsCompleted}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.3em",
                      color: "#F2F0E9",
                      opacity: 0.35,
                      display: "flex",
                    }}
                  >
                    JOBS DONE
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: profile photo */}
        {photoUrl && (
          <div
            style={{
              width: 260,
              height: 300,
              flexShrink: 0,
              position: "relative",
              display: "flex",
              border: "2px solid #222",
              overflow: "hidden",
            }}
          >
            {}
            <img
              src={photoUrl}
              alt={name}
              width={260}
              height={300}
              style={{ objectFit: "cover", filter: "grayscale(100%) contrast(1.1)" }}
            />
            {/* Corner brackets */}
            <div
              style={{
                position: "absolute",
                top: -2,
                left: -2,
                width: 20,
                height: 20,
                borderTop: "3px solid #E8FF00",
                borderLeft: "3px solid #E8FF00",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 20,
                height: 20,
                borderTop: "3px solid #E8FF00",
                borderRight: "3px solid #E8FF00",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -2,
                left: -2,
                width: 20,
                height: 20,
                borderBottom: "3px solid #E8FF00",
                borderLeft: "3px solid #E8FF00",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 20,
                height: 20,
                borderBottom: "3px solid #E8FF00",
                borderRight: "3px solid #E8FF00",
                display: "flex",
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 44,
          borderTop: "1px solid #222",
          display: "flex",
          alignItems: "center",
          paddingLeft: 52,
          paddingRight: 48,
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#F2F0E9",
            opacity: 0.25,
            display: "flex",
          }}
        >
          REACT · NEXT.JS · NODE.JS · TYPESCRIPT · POSTGRESQL
        </span>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#E8FF00",
            opacity: 0.6,
            display: "flex",
          }}
        >
          tanvirthedev.com
        </span>
      </div>
    </div>,
    { ...size }
  );
}
