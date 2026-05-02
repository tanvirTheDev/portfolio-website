import type { Metadata } from "next";
import { getAllExperience } from "@/lib/sanity/queries";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience in full-stack development — roles, responsibilities, and the tech stacks that powered them.",
  keywords: ["work history", "experience", "developer", "career", "full-stack"],
  alternates: { canonical: `${SITE_URL}/experience` },
  openGraph: {
    title: "Experience — Tanvir Ahmed",
    description:
      "Professional experience in full-stack development — roles, responsibilities, and the tech stacks that powered them.",
    type: "website",
    url: `${SITE_URL}/experience`,
  },
};

export default async function ExperiencePage() {
  const experience = await getAllExperience();

  return (
    <div>
      <KineticTitleLoader text="WORK HISTORY" label="003 / EXPERIENCE" />

      <div className="page" style={{ paddingTop: 48 }}>
        {experience.length === 0 && (
          <p style={{ opacity: 0.3, fontSize: 11, letterSpacing: "0.2em" }}>
            NO ENTRIES YET — ADD VIA /STUDIO
          </p>
        )}

        {/* Timeline wrapper — adds left accent line + dots */}
        <div className="exp-timeline">
          {experience.map((entry) => (
            <div key={entry._id} className="exp-entry" data-reveal="">
              {/* Left column: company + meta */}
              <div>
                <div className="exp-co">{entry.company}</div>
                <div className="exp-title">{entry.title}</div>
                <div className="exp-dates">
                  {entry.dateStart} — {entry.dateEnd ?? "PRESENT"}
                </div>
                {entry.location && <div className="exp-loc">{entry.location}</div>}

                {entry.stack?.length ? (
                  <div className="exp-stack">
                    {entry.stack.map((s) => (
                      <span key={s} className="tag">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Right column: bullets */}
              <div>
                {entry.bullets?.length ? (
                  <ul className="exp-bullets">
                    {entry.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="deco" style={{ marginTop: 40 }}>
          EXPERIENCE
        </div>
      </div>
    </div>
  );
}
