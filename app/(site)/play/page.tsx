import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Play",
  description: "Sky Shooter — 3-stage space combat game with persistent upgrades and leaderboard.",
};

const SkyShooter = dynamic(() => import("@/components/pages/SkyShooter"), {
  ssr: false,
  loading: () => (
    <div className="sky-wrap sky-loading">
      <span>LOADING MISSION...</span>
    </div>
  ),
});

export default function PlayPage() {
  return <SkyShooter />;
}
