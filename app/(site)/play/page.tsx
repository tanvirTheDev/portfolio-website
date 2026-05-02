import type { Metadata } from "next";
import SkyShooterClient from "./SkyShooterClient";

export const metadata: Metadata = {
  title: "Play",
  description: "Sky Shooter — 3-stage space combat game with persistent upgrades and leaderboard.",
};

export default function PlayPage() {
  return <SkyShooterClient />;
}
