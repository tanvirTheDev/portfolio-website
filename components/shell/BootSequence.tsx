"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY = "boot_v1_done";

type LineColor = "default" | "green" | "accent" | "dim";
type Line = { text: string; color: LineColor; delay: number };

function buildLines(name: string, projectCount: number): Line[] {
  const n = name.toUpperCase();
  const pad = (s: string, len: number) => s + " ".repeat(Math.max(0, len - s.length));
  return [
    { text: `> ${n} :: PORTFOLIO OS  v2.0`, color: "accent", delay: 0 },
    { text: `> ──────────────────────────────────────`, color: "dim", delay: 450 },
    { text: `> ${pad("KERNEL BOOT", 34)}[ OK ]`, color: "green", delay: 700 },
    { text: `> ${pad("AUTH MODULE", 34)}[ OK ]`, color: "green", delay: 1050 },
    {
      text: `> ${pad("MOUNTING /work", 24)}${String(projectCount).padStart(2, "0")} PROJECTS FOUND`,
      color: "green",
      delay: 1400,
    },
    { text: `> ${pad("MOUNTING /experience", 34)}[ OK ]`, color: "green", delay: 1750 },
    { text: `> ${pad("SSL HANDSHAKE", 34)}[ SECURE ]`, color: "green", delay: 2100 },
    { text: `> ──────────────────────────────────────`, color: "dim", delay: 2500 },
    { text: `> SYSTEM ONLINE · WELCOME, VISITOR.`, color: "accent", delay: 2900 },
  ];
}

export default function BootSequence({
  name,
  projectCount,
}: {
  name: string;
  projectCount: number;
}) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });
  const [shownCount, setShownCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
    }, 480);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const lines = buildLines(name, projectCount);
    const timers: ReturnType<typeof setTimeout>[] = [];

    lines.forEach((_, i) => {
      timers.push(setTimeout(() => setShownCount(i + 1), lines[i].delay));
    });

    const lastDelay = lines[lines.length - 1].delay;
    timers.push(setTimeout(() => dismiss(), lastDelay + 900));

    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, [visible, name, projectCount, dismiss]);

  if (!visible) return null;

  const lines = buildLines(name, projectCount);
  const displayed = lines.slice(0, shownCount);
  const done = shownCount >= lines.length;

  return (
    <div className={`boot-overlay${exiting ? "boot-exit" : ""}`} aria-hidden="true">
      <div className="boot-inner">
        {displayed.map((line, i) => (
          <div key={i} className={`boot-line boot-line--${line.color}`}>
            {line.text}
            {!done && i === displayed.length - 1 && <span className="boot-cursor" />}
          </div>
        ))}
        {done && <div className="boot-skip">[ PRESS ANY KEY OR CLICK TO CONTINUE ]</div>}
      </div>
    </div>
  );
}
