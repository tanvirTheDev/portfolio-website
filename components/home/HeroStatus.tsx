"use client";

import { useState, useEffect } from "react";

interface HeroStatusProps {
  availableText: string;
  isAvailable: boolean;
  role: string;
}

export default function HeroStatus({ availableText, isAvailable, role }: HeroStatusProps) {
  const [utc, setUtc] = useState("");
  const [loc, setLoc] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setUtc(now.toISOString().replace("T", " ").slice(0, 19) + "Z");
      setLoc(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " +06"
      );
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
        <span className="hs-k">UTC</span>
        <span className="hs-v acc">{utc || "——"}</span>
      </div>

      {/* Local time (Dhaka) */}
      <div className="hs-cell">
        <span className="hs-k">LOCAL</span>
        <span className="hs-v" style={{ fontVariantNumeric: "tabular-nums" }}>
          {loc || "——"}
        </span>
      </div>
    </div>
  );
}
