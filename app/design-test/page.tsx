export const metadata = { title: "Design System Test" };

export default function TestPage() {
  return (
    <div style={{ marginLeft: 196, paddingTop: 26 }}>
      {/* ── GRID LAYER ── */}
      <div className="grid-bg" />

      <div className="page" style={{ paddingTop: 48 }}>
        {/* ── COLOUR TOKENS ── */}
        <p className="slabel">01 — Colour Tokens</p>
        <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
          {(
            [
              ["--bg", "bg"],
              ["--fg", "fg"],
              ["--accent", "accent"],
              ["--border", "border"],
              ["--dim", "dim"],
            ] as const
          ).map(([token, label]) => (
            <div
              key={token}
              style={{
                width: 80,
                height: 80,
                background: `var(${token})`,
                border: "1px solid var(--border)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  fontSize: 7,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: label === "bg" || label === "dim" ? "#f2f0e9" : "#0a0a0a",
                  opacity: 0.7,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── TYPE SCALE ── */}
        <p className="slabel">02 — Type Scale</p>
        <div style={{ marginBottom: 48 }}>
          <div className="sec-title" style={{ marginBottom: 8 }}>
            Display Heading
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              opacity: 0.7,
              maxWidth: "60ch",
              marginBottom: 8,
            }}
          >
            Body text — JetBrains Mono 14px, line-height 1.8, opacity 0.7. The quick brown fox jumps
            over the lazy dog.
          </p>
          <p className="slabel" style={{ marginBottom: 0 }}>
            Section Label — 8px / 0.45em tracking
          </p>
        </div>

        {/* ── TAGS ── */}
        <p className="slabel">03 — Tags</p>
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 48 }}>
          {["Next.js", "TypeScript", "Sanity", "GSAP", "Matter.js", "Tailwind v4"].map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>

        {/* ── BUTTONS ── */}
        <p className="slabel">04 — Buttons</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48 }}>
          <button className="btn">Ghost Button</button>
          <button className="btn btn-solid">Solid Button</button>
        </div>

        {/* ── BORDERS ── */}
        <p className="slabel">05 — Borders (radius: 0 everywhere)</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div style={{ border: "1px solid var(--border)", padding: 20 }}>
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                opacity: 0.4,
              }}
            >
              1px / --border
            </span>
          </div>
          <div style={{ border: "1px solid var(--fg)", padding: 20 }}>
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                opacity: 0.4,
              }}
            >
              1px / --fg
            </span>
          </div>
          <div
            style={{
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--accent)",
              padding: 20,
            }}
          >
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                opacity: 0.4,
              }}
            >
              accent left rule
            </span>
          </div>
        </div>

        {/* ── WORK TABLE ROW PREVIEW ── */}
        <p className="slabel">06 — Work Table</p>
        <div style={{ marginBottom: 48, border: "1px solid var(--border)" }}>
          <div className="dir-head">
            <span>IDX</span>
            <span>NAME</span>
            <span>YEAR</span>
            <span>STATUS</span>
            <span>STACK</span>
          </div>
          {[
            {
              idx: "001",
              name: "PROJECT ALPHA",
              year: "2026",
              status: "SHIPPED",
              stack: "Next.js · Sanity",
            },
            {
              idx: "002",
              name: "PROJECT BETA",
              year: "2025",
              status: "IN_PROGRESS",
              stack: "React · GSAP",
            },
          ].map((row) => (
            <div key={row.idx} className="dir-row" style={{ cursor: "none" }}>
              <span className="di">{row.idx}</span>
              <span className="dn">{row.name}</span>
              <span className="ds">{row.year}</span>
              <span className="ds">{row.status}</span>
              <span className="dd">{row.stack}</span>
            </div>
          ))}
        </div>

        {/* ── NAV ITEM PREVIEW ── */}
        <p className="slabel">07 — Nav Item States</p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 196,
            border: "1px solid var(--border)",
            marginBottom: 48,
          }}
        >
          <a href="#" className="nav-item active">
            /WORK
          </a>
          <a href="#" className="nav-item">
            /EXPERIENCE
          </a>
          <a href="#" className="nav-item">
            /CONTACT
          </a>
        </div>

        {/* ── DOC STRIP PREVIEW ── */}
        <p className="slabel">08 — Doc Strip</p>
        <div
          className="doc-strip"
          style={{
            position: "relative",
            top: "auto",
            left: "auto",
            right: "auto",
            marginBottom: 48,
          }}
        >
          <span>portfolio/work/index.tsx</span>
          <span className="acc">v1.0.0</span>
          <span>ln 001</span>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
