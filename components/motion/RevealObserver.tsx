"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Global scroll-reveal orchestrator.
 *
 * Any element in the DOM carrying `data-reveal` will animate in
 * (opacity 0→1, translateY 28px→0) when it enters the viewport.
 * The `data-revealed` attribute is set after the trigger is created
 * so navigating back to a page doesn't re-animate shared elements.
 *
 * Re-runs on every pathname change so new page content is picked up
 * after client-side navigation.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Small delay to let framer-motion finish the page-enter animation
    // and for Next.js to paint the new page's DOM nodes.
    const id = window.setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])");

      els.forEach((el, i) => {
        el.setAttribute("data-revealed", "true");

        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.055, // stagger siblings that enter together
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              once: true,
            },
          }
        );
      });

      // Recompute all trigger positions after new content is laid out
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      window.clearTimeout(id);
    };
  }, [pathname]);

  return null;
}
