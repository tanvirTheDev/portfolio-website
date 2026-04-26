"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin once at module level (idempotent)
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialises Lenis smooth scroll and wires it into the GSAP RAF loop
 * so ScrollTrigger positions stay in sync.
 *
 * Skips setup entirely when the user prefers reduced motion.
 * Lenis is kept in a ref — no state, no re-renders.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = instance;

    // Wire Lenis into the GSAP RAF loop
    const rafFn = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(rafFn);
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger positions in sync with Lenis scroll progress
    instance.on("scroll", () => ScrollTrigger.update());

    return () => {
      gsap.ticker.remove(rafFn);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
