"use client";

import { useEffect } from "react";
import { useAudio } from "@/lib/audio";

/**
 * Mounts a single document-level click listener that plays a clack
 * whenever the user clicks any <a> or <button> element.
 *
 * This covers:
 *  - All nav links (SideNav, dir-rows, CTA buttons)
 *  - All page-to-page navigation
 *  - All interactive buttons
 *
 * Skipped: clicks inside the Sky Shooter game (canvas element)
 * and clicks when sound is muted.
 */
export default function GlobalClickSound() {
  const { clack } = useAudio();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Walk up the DOM tree to find the nearest a or button
      const el = target.closest("a, button");
      if (!el) return;
      // Skip game canvas area
      if (el.closest("#sky-shooter-root, canvas")) return;
      // Skip the sound toggle itself (it handles its own clack)
      if (el.classList.contains("snd-btn")) return;
      clack();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [clack]);

  return null;
}
