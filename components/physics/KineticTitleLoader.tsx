"use client";

/**
 * Client-side loader for KineticTitle.
 *
 * `ssr: false` is only valid inside a Client Component in Next.js 16.
 * This thin wrapper lives here so the Server Component home page can
 * import it without triggering the "ssr:false in Server Component" error.
 */

import dynamic from "next/dynamic";

const KineticTitle = dynamic(() => import("./KineticTitle"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "52vh",
        borderBottom: "1px solid var(--border)",
      }}
    />
  ),
});

export default function KineticTitleLoader({ text }: { text: string }) {
  return <KineticTitle text={text} />;
}
