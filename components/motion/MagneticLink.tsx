"use client";

import { useRef, useCallback, type MouseEvent } from "react";
import gsap from "gsap";

interface MagneticLinkProps {
  children: React.ReactNode;
  /** Fraction of cursor offset to apply as translation. Lower = subtler. */
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wraps any child with a magnetic hover effect.
 * The element translates toward the cursor while hovered, then
 * springs back with an elastic ease when the cursor leaves.
 *
 * Disable on mobile / touch by checking pointer capability at the
 * call site (`@media (hover: hover)` or `window.matchMedia`).
 */
export default function MagneticLink({
  children,
  strength = 0.32,
  className,
  style,
}: MagneticLinkProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const handleMove = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    },
    [strength]
  );

  const handleLeave = useCallback(() => {
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    });
  }, []);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", ...style }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </span>
  );
}
