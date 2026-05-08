import type { Metadata } from "next";
import KineticHeader from "@/components/ui/KineticHeader";
import ContactForm from "@/components/pages/ContactForm";
import { getSiteSettings } from "@/lib/sanity/queries";

/** Extract YouTube video ID from any common URL format */
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      return u.searchParams.get("v");
    }
  } catch {}
  return null;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Tanvir Ahamed for freelance work, full-time roles, or project collaborations.",
  keywords: ["contact", "hire", "freelance", "full-stack developer", "collaboration"],
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact — Tanvir Ahamed",
    description:
      "Get in touch with Tanvir Ahamed for freelance work, full-time roles, or project collaborations.",
    type: "website",
    url: `${SITE_URL}/contact`,
  },
};

type SocialLink = { label: string; href: string; short: string };

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null);
  const videoId = settings?.introVideoUrl ? getYouTubeId(settings.introVideoUrl) : null;

  const strip = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "");
  // Only show the core professional contact channels — keeps it clean
  const links: SocialLink[] = [];
  if (settings?.email)
    links.push({ label: "EMAIL", href: `mailto:${settings.email}`, short: settings.email });
  if (settings?.githubUrl)
    links.push({ label: "GITHUB", href: settings.githubUrl, short: strip(settings.githubUrl) });
  if (settings?.linkedinUrl)
    links.push({
      label: "LINKEDIN",
      href: settings.linkedinUrl,
      short: strip(settings.linkedinUrl),
    });

  return (
    <div className="page" style={{ paddingTop: 60, maxWidth: 900 }}>
      <span className="slabel">006 / CONTACT</span>

      <KineticHeader text="TRANSMIT" />

      {/* ── Social links — shown near top before the form ── */}
      {links.length > 0 && (
        <div className="contact-socials" data-reveal="">
          {links.map(({ label, href, short }) => (
            <a
              key={label}
              className="contact-social-link"
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            >
              <span className="contact-social-label">{label}</span>
              <span className="contact-social-val">{short}</span>
            </a>
          ))}
        </div>
      )}

      {/* ── INTRO VIDEO — closes the deal before they hit send ── */}
      {videoId && (
        <div className="contact-video-wrap" data-reveal="">
          <div className="contact-video-label">
            <span className="contact-video-tag">MEET THE DEVELOPER</span>
            <span className="contact-video-dur">· 1:30</span>
          </div>
          <div className="video-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={`${settings?.name ?? "Developer"} — intro video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}

      <ContactForm />

      <div className="deco" style={{ marginTop: 60 }}>
        TRANSMIT
      </div>
    </div>
  );
}
