"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HeroStatusProps {
  availableText: string;
  isAvailable: boolean;
  role: string;
  resumeUrl?: string;
}

export default function HeroStatus({
  availableText,
  isAvailable,
  role,
  resumeUrl,
}: HeroStatusProps) {
  const [utc, setUtc] = useState("");
  const [frame, setFrame] = useState("00000");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setUtc(now.toISOString().replace("T", " ").slice(0, 19) + "Z");
      setFrame(String(Math.floor(now.getSeconds() * 30)).padStart(5, "0"));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-status">
      {/* Availability dot */}
      <div className="hs-cell">
        <span className="hs-dot" data-available={isAvailable ? "true" : "false"} />
        <span className="hs-label">{availableText}</span>
      </div>

      {/* Role */}
      <div className="hs-cell">
        <span className="hs-k">ROLE</span>
        <span className="hs-v">{role}</span>
      </div>

      {/* Live UTC clock */}
      <div className="hs-cell">
        <span className="hs-k">SYS_TIME</span>
        <span className="hs-v acc">{utc || "——"}</span>
      </div>

      {/* Frame counter doubles as uptime indicator */}
      <div className="hs-cell">
        <span className="hs-k">FRAME</span>
        <span className="hs-v" style={{ fontVariantNumeric: "tabular-nums" }}>
          {frame}
        </span>
      </div>

      {/* CTA buttons */}
      <div className="hs-cell hs-actions">
        <Link href="/work" className="hs-btn solid">
          VIEW WORK ↓
        </Link>
        <Link href="/contact" className="hs-btn">
          GET IN TOUCH
        </Link>
        {resumeUrl && resumeUrl !== "#" && (
          <a className="hs-btn dim" href={resumeUrl} target="_blank" rel="noopener noreferrer">
            ↓ RÉSUMÉ
          </a>
        )}
      </div>
    </div>
  );
}
