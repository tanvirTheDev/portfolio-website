"use client";

import { useAudio } from "@/lib/audio";

/**
 * SND: ON / SND: OFF button rendered at the bottom of SideNav.
 * Consumes the useAudio hook — plays a clack on unmute.
 */
export default function SoundToggle() {
  const { muted, toggle, clack } = useAudio();

  const handleClick = () => {
    toggle();
    if (muted) {
      // Was muted → now unmuted → play confirmation clack
      // Use setTimeout so state update runs first
      setTimeout(clack, 0);
    }
  };

  return (
    <button
      className="snd-btn"
      onClick={handleClick}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
    >
      SND: {muted ? "OFF" : "ON"}
    </button>
  );
}
