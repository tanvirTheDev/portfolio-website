import type { Metadata } from "next";
import SpaceShooter from "@/components/pages/SpaceShooter";

export const metadata: Metadata = {
  title: "Play",
  description: "Space Shooter — defend the codebase. A mini game built into the portfolio.",
};

export default function PlayPage() {
  return <SpaceShooter />;
}
