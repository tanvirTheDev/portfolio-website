"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAudio } from "@/lib/audio";

const KEY_MAP: Record<string, string> = {
  "1": "/",
  "2": "/work",
  "3": "/experience",
  "4": "/certificates",
  "5": "/blog",
  "6": "/contact",
};

/**
 * Global keyboard shortcut: keys 1–6 navigate between pages.
 * Matches the prototype's document-level keydown listener.
 * Skipped when focus is inside a form element.
 */
export default function KeyboardNav() {
  const router = useRouter();
  const { clack } = useAudio();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack key presses inside inputs / textareas / contenteditable
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const href = KEY_MAP[e.key];
      if (href) {
        e.preventDefault();
        clack();
        router.push(href);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, clack]);

  return null;
}
