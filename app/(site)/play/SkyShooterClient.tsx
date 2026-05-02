"use client";

import dynamic from "next/dynamic";

const SkyShooter = dynamic(() => import("@/components/pages/SkyShooter"), {
  ssr: false,
  loading: () => (
    <div className="sky-wrap sky-loading">
      <span>LOADING MISSION...</span>
    </div>
  ),
});

export default function SkyShooterClient() {
  return <SkyShooter />;
}
