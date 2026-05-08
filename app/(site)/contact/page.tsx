import type { Metadata } from "next";
import KineticHeader from "@/components/ui/KineticHeader";
import ContactForm from "@/components/pages/ContactForm";
import { getSiteSettings } from "@/lib/sanity/queries";

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

type SocialLink = { label: string; href: string; short: string; accent?: boolean };

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null);

  const strip = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "");

  // Core professional contact channels only
  const links: SocialLink[] = [];
  if (settings?.email)
    links.push({ label: "EMAIL", href: `mailto:${settings.email}`, short: settings.email });
  if (settings?.whatsappNumber) {
    const cleaned = settings.whatsappNumber.replace(/\s+/g, "");
    links.push({
      label: "WHATSAPP",
      href: `https://wa.me/${cleaned.replace(/\+/g, "")}`,
      short: settings.whatsappNumber,
      accent: true,
    });
  }
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

      {/* ── Contact channels ── */}
      {links.length > 0 && (
        <div className="contact-socials" data-reveal="">
          {links.map(({ label, href, short, accent }) => (
            <a
              key={label}
              className={`contact-social-link${accent ? "contact-social-link--accent" : ""}`}
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

      {/* ── Message form ── */}
      <ContactForm />

      <div className="deco" style={{ marginTop: 60 }}>
        TRANSMIT
      </div>
    </div>
  );
}
