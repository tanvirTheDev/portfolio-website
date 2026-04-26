"use client";

import { useEffect, useRef } from "react";
import styles from "@/styles/cursor.module.css";

/**
 * Custom square cursor — replaces the native pointer.
 * - Outer ring: lags behind with lerp (matches prototype's 0.14 factor)
 * - Inner dot: snaps to exact mouse position
 * - Hover state: expands + acid-yellow fill on <a>, <button>, textarea
 *
 * Uses CSS Module classes, not IDs, so multiple instances are safe (though
 * only one should be mounted — lives in the site shell layout).
 */
export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let mx = -100,
      my = -100;
    let cx = -100,
      cy = -100;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    };

    const tick = () => {
      cx += (mx - cx) * 0.14;
      cy += (my - cy) * 0.14;
      ring.style.left = `${cx}px`;
      ring.style.top = `${cy}px`;
      rafId = requestAnimationFrame(tick);
    };

    const onEnter = () => ring.classList.add(styles.cursorHover);
    const onLeave = () => ring.classList.remove(styles.cursorHover);

    const addListeners = () => {
      document.querySelectorAll<HTMLElement>("a, button, textarea, [data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    document.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);

    // Initial pass + observe DOM mutations so newly mounted elements are covered
    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Don't mount on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return null;

  return (
    <>
      <div ref={ringRef} className={styles.cursor} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
