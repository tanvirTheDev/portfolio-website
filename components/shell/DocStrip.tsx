"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Maps Next.js routes → fake file paths displayed in the doc strip. */
function routeToPath(pathname: string): string {
  if (pathname === "/") return "app/(site)/page.tsx";
  if (pathname.startsWith("/work/") && pathname.length > 6)
    return `app/(site)/work/${pathname.slice(6)}/page.tsx`;
  const map: Record<string, string> = {
    "/work": "app/(site)/work/page.tsx",
    "/experience": "app/(site)/experience/page.tsx",
    "/certificates": "app/(site)/certificates/page.tsx",
    "/blog": "app/(site)/blog/page.tsx",
    "/contact": "app/(site)/contact/page.tsx",
  };
  return map[pathname] ?? `app/(site)${pathname}/page.tsx`;
}

function routeToLineNum(pathname: string): string {
  const map: Record<string, string> = {
    "/": "001",
    "/work": "002",
    "/experience": "003",
    "/certificates": "004",
    "/blog": "005",
    "/contact": "006",
  };
  return map[pathname] ?? "001";
}

/**
 * Thin top bar showing:
 *   left:   current fake file path
 *   centre: live ISO timestamp (updates every second)
 *   right:  ln + page number
 *
 * Matches the prototype's `.doc-strip` exactly.
 */
export default function DocStrip() {
  const pathname = usePathname();
  const [ts, setTs] = useState("");

  useEffect(() => {
    const tick = () => setTs(new Date().toISOString().replace("T", " ").slice(0, 19) + "Z");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="doc-strip">
      <span>{routeToPath(pathname)}</span>
      <span className="acc">{ts}</span>
      <span>ln {routeToLineNum(pathname)}</span>
    </div>
  );
}
