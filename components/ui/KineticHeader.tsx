"use client";

import { useCallback, useRef } from "react";

interface Props {
  text: string;
  className?: string;
}

/**
 * Repel-on-hover kinetic header.
 * Each letter repels away from the cursor proportionally to distance.
 * Matches the source's mousemove approach exactly.
 */
export default function KineticHeader({ text, className = "kinetic-hdr" }: Props) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const spans = containerRef.current?.querySelectorAll<HTMLSpanElement>("span");
    if (!spans) return;
    spans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 120;
      if (dist < maxDist) {
        const force = ((maxDist - dist) / maxDist) * 28;
        const angle = Math.atan2(dy, dx);
        span.style.transform = `translate(${-Math.cos(angle) * force}px, ${-Math.sin(angle) * force}px)`;
        span.style.color = "var(--accent)";
      } else {
        span.style.transform = "";
        span.style.color = "";
      }
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    const spans = containerRef.current?.querySelectorAll<HTMLSpanElement>("span");
    spans?.forEach((span) => {
      span.style.transform = "";
      span.style.color = "";
    });
  }, []);

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      aria-label={text}
    >
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden="true">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
