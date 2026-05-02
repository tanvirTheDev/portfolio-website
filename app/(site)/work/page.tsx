import type { Metadata } from "next";
import { getAllProjects } from "@/lib/sanity/queries";
import WorkList from "@/components/pages/WorkList";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

export const metadata: Metadata = {
  title: "Work — Tanvir Ahmed",
  description:
    "Full-stack projects — web apps, APIs, and tools built with React, Next.js, Node.js, and more.",
  openGraph: {
    title: "Work — Tanvir Ahmed",
    description:
      "Full-stack projects — web apps, APIs, and tools built with React, Next.js, Node.js, and more.",
    type: "website",
  },
};

export default async function WorkPage() {
  const projects = await getAllProjects();

  return (
    <div>
      {/* ── PHYSICS STAGE ── */}
      <KineticTitleLoader text="SPECIMEN ARCHIVE" label="002 / WORK" />

      {/* ── WORK HEADER ── */}
      <div className="page" style={{ paddingTop: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 24,
            marginBottom: 40,
          }}
        >
          <div />
          <div
            style={{
              textAlign: "right",
              fontSize: 9,
              opacity: 0.25,
              lineHeight: 2.2,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {projects.length} ENTRIES
            <br />
            READ-ONLY
            <br />
            SORTED BY ORDER
          </div>
        </div>

        <WorkList projects={projects} />

        <div className="deco" style={{ marginTop: 40 }}>
          OPEN SOURCE
        </div>
      </div>
    </div>
  );
}
