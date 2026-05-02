"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SoundToggle from "./SoundToggle";
import MagneticLink from "@/components/motion/MagneticLink";

const NAV_ITEMS = [
  { label: "INDEX", href: "/", key: "1" },
  { label: "WORK", href: "/work", key: "2" },
  { label: "EXPERIENCE", href: "/experience", key: "3" },
  { label: "CERTIFICATES", href: "/certificates", key: "4" },
  { label: "BLOG", href: "/blog", key: "5" },
  { label: "CONTACT", href: "/contact", key: "6" },
  { label: "PLAY", href: "/play", key: "7" },
] as const;

interface Props {
  name: string;
  tagline?: string;
}

export default function SideNav({ name, tagline }: Props) {
  const pathname = usePathname();

  return (
    <nav className="side-nav" aria-label="Primary navigation">
      {/* Logo / identity — magnetic on hover */}
      <MagneticLink strength={0.2} style={{ display: "block" }}>
        <div className="nav-logo">
          {name}
          {tagline && <span className="nav-subtitle">{tagline}</span>}
        </div>
      </MagneticLink>

      {/* Nav links */}
      {NAV_ITEMS.map(({ label, href, key }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={["nav-item", isActive ? "active" : ""].filter(Boolean).join(" ")}
            aria-current={isActive ? "page" : undefined}
            aria-label={`${key} — ${label}`}
          >
            <span style={{ opacity: 0.3, marginRight: 10, fontSize: 7 }}>{key}</span>
            {label}
          </Link>
        );
      })}

      {/* Sound toggle at the bottom */}
      <div className="nav-bottom">
        <SoundToggle />
      </div>
    </nav>
  );
}
