"use client";

/** Renders the COMPILED timestamp + checksum in the home manifest header.
 *  Must be a client component — Next.js 16 forbids new Date() in cached server components.
 */
export default function BuildStamp() {
  const now = new Date().toISOString();
  const checksum = now.slice(2, 4) + now.slice(5, 7) + now.slice(8, 10);

  return (
    <>
      COMPILED <em style={{ color: "var(--accent)", fontStyle: "normal" }}>{now.slice(0, 19)}Z</em>
      &nbsp;·&nbsp; CHECKSUM{" "}
      <em style={{ color: "var(--accent)", fontStyle: "normal" }}>{checksum}</em>
    </>
  );
}
