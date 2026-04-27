"use client";

/**
 * Client-side loader for KineticTitle.
 * `ssr: false` is only valid inside a Client Component in Next.js 16.
 */

import dynamic from "next/dynamic";

const KineticTitle = dynamic(() => import("./KineticTitle"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "clamp(340px, 52vh, 560px)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}
    />
  ),
});

interface Props {
  text: string;
  label?: string;
}

export default function KineticTitleLoader({ text, label }: Props) {
  return <KineticTitle text={text} label={label} />;
}
