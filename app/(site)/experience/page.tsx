import type { Metadata } from "next";
import { getAllExperience } from "@/lib/sanity/queries";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

export const metadata: Metadata = { title: "Experience" };

export default async function ExperiencePage() {
  const experience = await getAllExperience();

  return (
    <div>
      {/* ── PHYSICS STAGE ── */}
      <KineticTitleLoader text="WORK HISTORY" label="003 / EXPERIENCE" />

      {/* ── EXPERIENCE CONTENT ── */}
      <div className="page" style={{ paddingTop: 48 }}>
        {experience.length === 0 && (
          <p style={{ opacity: 0.3, fontSize: 11, letterSpacing: "0.2em" }}>
            NO ENTRIES YET — ADD VIA /STUDIO
          </p>
        )}

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

        <div className="deco" style={{ marginTop: 40 }}>
          EXPERIENCE
        </div>
      </div>
    </div>
  );
}
