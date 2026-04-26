"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Project } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";

const STATUS_CLASS: Record<string, string> = {
  SHIPPED: "s",
  "OPEN SOURCE": "o",
  BETA: "b",
  ARCHIVED: "a",
};

interface Props {
  projects: Project[];
}

export default function WorkList({ projects }: Props) {
  const [hovered, setHovered] = useState<Project | null>(null);

  return (
    <>
      <table className="work-table">
        <thead>
          <tr>
            <th>IDX</th>
            <th>PROJECT</th>
            <th>YEAR</th>
            <th>STATUS</th>
            <th>STACK</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr
              key={p._id}
              className={hovered?._id === p._id ? "hov" : ""}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
              data-reveal=""
            >
              <td className="td-idx">{String(i + 1).padStart(3, "0")}</td>
              <td className="td-name">
                <Link
                  href={`/work/${p.slug.current}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {p.title}
                </Link>
              </td>
              <td className="td-year">{p.year ?? "—"}</td>
              <td>
                <span className={`td-status ${STATUS_CLASS[p.status] ?? ""}`}>{p.status}</span>
              </td>
              <td className="td-stack">{(p.stack ?? []).slice(0, 3).join(" · ")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Side panel ── */}
      {hovered && (
        <div className="work-panel">
          {/* Thumbnail */}
          {hovered.thumbnail ? (
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                position: "relative",
                border: "1px solid var(--border)",
              }}
            >
              <Image
                src={urlFor(hovered.thumbnail).width(544).height(306).url()}
                alt={hovered.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="272px"
              />
            </div>
          ) : (
            <div className="panel-thumb">NO PREVIEW</div>
          )}

          <div className="panel-name">{hovered.title}</div>
          {hovered.tagline && <div className="panel-tagline">{hovered.tagline}</div>}

          <div className="panel-meta">
            {hovered.year && `${hovered.year} · `}
            {hovered.status}
            {hovered.stack?.length ? `\n${hovered.stack.slice(0, 4).join(" · ")}` : ""}
          </div>

          <Link href={`/work/${hovered.slug.current}`} className="panel-open-btn">
            OPEN →
          </Link>
        </div>
      )}
    </>
  );
}
