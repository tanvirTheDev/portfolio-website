import type { Metadata } from "next";
import { getAllProjects } from "@/lib/sanity/queries";
import WorkList from "@/components/pages/WorkList";

export const metadata: Metadata = { title: "Work" };

export default async function WorkPage() {
  const projects = await getAllProjects();

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      {/* Header */}
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
        <div>
          <span className="slabel">002 / WORK</span>
          <h1 className="sec-title">
            SPECIMEN
            <br />
            ARCHIVE
          </h1>
        </div>
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
  );
}
