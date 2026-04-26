"use client";

import { useSyncExternalStore } from "react";

// Stable refs — defined outside the hook so they're never recreated.
const subscribe = (cb: () => void): (() => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const getSnapshot = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getServerSnapshot = (): boolean => false;

/**
 * Returns true when the user has requested reduced motion.
 * Uses useSyncExternalStore so it updates reactively when the OS
 * setting changes without a useEffect + setState cascade.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
