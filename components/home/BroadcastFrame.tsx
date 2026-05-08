"use client";

import { useState, useEffect } from "react";
import Waveform from "./Waveform";

interface BroadcastFrameProps {
  // Left rail — transmission metadata
  transmissionId?: string;
  channel?: string;
  duration?: string;
  recordedAt?: string;
  location?: string;
  // Center — video
  youtubeId?: string;
  videoTitle?: string;
  // Right — operator card
  profileImageUrl?: string;
  name: string;
  role: string;
  upworkSuccess?: string; // e.g. "100%"
  upworkJobs?: number; // e.g. 47
  upworkEarnings?: string; // e.g. "$50K+"
}

export default function BroadcastFrame({
  transmissionId = "TX-0001",
  channel = "TANVIR_DEV",
  duration = "01:30",
  recordedAt,
  location = "REMOTE / DHAKA",
  youtubeId,
  videoTitle = "WHO IS TANVIR AHAMED",
  profileImageUrl,
  name,
  role,
  upworkSuccess,
  upworkJobs,
  upworkEarnings,
}: BroadcastFrameProps) {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState("00000");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setFrame(String(Math.floor(now.getSeconds() * 30)).padStart(5, "0"));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const displayDate = recordedAt || new Date().toISOString().slice(0, 10);

  return (
    <div className="bcast">
      {/* ── LEFT RAIL — transmission metadata ── */}
      <aside className="bc-meta">
        <div className="bc-meta-grp">
          <span className="bc-meta-k">TRANSMISSION</span>
          <span className="bc-meta-v acc">{transmissionId}</span>
        </div>
        <div className="bc-meta-grp">
          <span className="bc-meta-k">CHANNEL</span>
          <span className="bc-meta-v">{channel}</span>
        </div>
        <div className="bc-meta-grp">
          <span className="bc-meta-k">RUNTIME</span>
          <span className="bc-meta-v">{duration}</span>
        </div>
        <div className="bc-meta-grp">
          <span className="bc-meta-k">RECORDED</span>
          <span className="bc-meta-v">{displayDate}</span>
        </div>
        <div className="bc-meta-grp">
          <span className="bc-meta-k">ORIGIN</span>
          <span className="bc-meta-v">{location}</span>
        </div>
        <div className="bc-meta-vert">SIGNAL STRONG · HD · STEREO</div>
      </aside>

      {/* ── CENTER — monitor ── */}
      <div className="bc-center">
        {/* Top row */}
        <div className="bc-toprow">
          <span className="bc-rec">
            <span className="bc-rec-dot" />
            <span>REC · LIVE TRANSMISSION</span>
          </span>
          <span className="bc-tape">►► TAPE {transmissionId} ◄◄</span>
          <span className="bc-frame-ind">FRAME {frame}</span>
        </div>

        {/* Monitor */}
        <div className="bc-monitor">
          <span className="bc-corner tl" />
          <span className="bc-corner tr" />
          <span className="bc-corner bl" />
          <span className="bc-corner br" />

          {!playing ? (
            <div className="bc-poster" onClick={() => setPlaying(true)}>
              {youtubeId && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="bc-thumb"
                  src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="bc-scan" />
              <div className="bc-noise" />
              <button className="bc-play" aria-label="Play intro video">
                <svg viewBox="0 0 60 60" width="52" height="52">
                  <polygon points="20,12 48,30 20,48" fill="currentColor" />
                </svg>
                <span className="bc-play-l">PLAY TRANSMISSION</span>
              </button>
              <div className="bc-overlay-tl">
                ▌ {videoTitle} · {duration}
              </div>
              <div className="bc-overlay-tr">CH 01 · {channel}</div>
              <div className="bc-overlay-bl">PRESS ▶ TO INITIATE</div>
              <div className="bc-overlay-br">{displayDate}</div>
            </div>
          ) : youtubeId ? (
            <iframe
              className="bc-iframe"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* No video configured — show placeholder */
            <div className="bc-poster" style={{ cursor: "default" }}>
              <div className="bc-scan" />
              <div className="bc-noise" />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 12,
                  color: "var(--fg)",
                  opacity: 0.35,
                  fontSize: 10,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                <span>NO SIGNAL</span>
                <span style={{ fontSize: 8, opacity: 0.6 }}>
                  ADD INTRO VIDEO IN SANITY → SITE SETTINGS
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Waveform row */}
        <div className="bc-waverow">
          <span className="bc-wave-l">AUDIO IN</span>
          <div className="bc-wave">
            <Waveform height={36} />
          </div>
          <span className="bc-wave-r acc">-12 dB</span>
        </div>
      </div>

      {/* ── RIGHT — operator card ── */}
      <aside className="bc-op">
        {/* Profile photo */}
        <div className="bc-op-photo">
          {profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImageUrl} alt={name} />
          ) : (
            <span className="bc-op-ph">[PHOTO]</span>
          )}
          <span className="bc-op-corner tl" />
          <span className="bc-op-corner tr" />
          <span className="bc-op-corner bl" />
          <span className="bc-op-corner br" />
        </div>

        <div className="bc-op-name">{name}</div>
        <div className="bc-op-title">{role}</div>

        {/* Upwork stats */}
        <div className="bc-op-stats">
          <div>
            <span className="bc-op-k">UPWORK</span>
            <span className="bc-op-v acc">{upworkSuccess ?? "—"}</span>
            <span className="bc-op-sub">JOB SUCCESS</span>
          </div>
          <div>
            <span className="bc-op-k">JOBS</span>
            <span className="bc-op-v">{upworkJobs ?? "—"}</span>
            <span className="bc-op-sub">COMPLETED</span>
          </div>
          <div>
            <span className="bc-op-k">EARNED</span>
            <span className="bc-op-v">{upworkEarnings ?? "—"}</span>
            <span className="bc-op-sub">LIFETIME</span>
          </div>
        </div>

        {/* Vitals */}
        <div className="bc-op-vitals">
          <div className="bc-vital">
            <span>STATUS</span>
            <span className="acc">OK</span>
          </div>
          <div className="bc-vital">
            <span>UPTIME</span>
            <span>HIGH</span>
          </div>
          <div className="bc-vital">
            <span>LOAD</span>
            <span>NORM</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
