"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "portfolio:muted";

// ── localStorage store for useSyncExternalStore ────────────────────────────────

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false; // Default for SSR — sound is on
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

/**
 * Web Audio API click sound + mute toggle.
 * Matches the source's clack() function exactly.
 * - Requires user gesture before first play (browser autoplay policy).
 * - Persists mute state to localStorage; syncs across tabs via storage event.
 */
export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  // useSyncExternalStore is the React-idiomatic way to subscribe to external
  // storage — avoids calling setState synchronously inside useEffect.
  const muted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
    return ctxRef.current;
  }, []);

  const clack = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const buf = ctx.createBuffer(1, 600, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < 600; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 70);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = 0.25;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch {
      /* AudioContext blocked or unavailable */
    }
  }, [muted, getCtx]);

  const toggle = useCallback(() => {
    const next = !muted;
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      // Dispatch a storage event so other tabs / useSyncExternalStore re-reads
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch {
      /* ignore */
    }
  }, [muted]);

  return { muted, clack, toggle };
}
