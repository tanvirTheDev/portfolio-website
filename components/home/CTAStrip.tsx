import Link from "next/link";

interface Props {
  isAvailable: boolean;
  availableText: string;
  upworkUrl?: string;
  resumeUrl?: string;
}

export default function CTAStrip({ isAvailable, availableText, upworkUrl, resumeUrl }: Props) {
  return (
    <section className="cta-strip">
      {/* Faded background word */}
      <div className="cta-strip-bg-word" aria-hidden="true">
        HIRE
      </div>

      <div className="cta-strip-inner">
        {/* Availability status */}
        <div className="cta-strip-status">
          <span className="hs-dot" data-available={isAvailable ? "true" : "false"} />
          <span className="cta-strip-avail">{availableText}</span>
        </div>

        {/* Big title */}
        <h2 className="cta-strip-title">
          LET&apos;S BUILD
          <br />
          <span>SOMETHING GREAT</span>
        </h2>

        {/* Sub */}
        <p className="cta-strip-sub">
          Fast turnaround · Clean code · Full-stack delivery from idea to deployment
        </p>

        {/* Buttons */}
        <div className="cta-strip-btns">
          {upworkUrl && (
            <a
              href={upworkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-strip-btn solid"
            >
              HIRE ME ON UPWORK ↗
            </a>
          )}
          <Link href="/contact" className="cta-strip-btn">
            SEND A MESSAGE →
          </Link>
          {resumeUrl && resumeUrl !== "#" && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-strip-btn dim"
            >
              ↓ DOWNLOAD RÉSUMÉ
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
