import type { Metadata } from "next";
import KineticHeader from "@/components/ui/KineticHeader";
import ContactForm from "@/components/pages/ContactForm";
import { getSiteSettings } from "@/lib/sanity/queries";

export const metadata: Metadata = { title: "Contact" };

type SocialLink = { label: string; href: string };

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null);

  const links: SocialLink[] = [];
  if (settings?.email) links.push({ label: "EMAIL", href: `mailto:${settings.email}` });
  if (settings?.githubUrl) links.push({ label: "GITHUB", href: settings.githubUrl });
  if (settings?.linkedinUrl) links.push({ label: "LINKEDIN", href: settings.linkedinUrl });
  if (settings?.mediumUsername)
    links.push({ label: "MEDIUM", href: `https://medium.com/@${settings.mediumUsername}` });

  return (
    <div className="page" style={{ paddingTop: 60, maxWidth: 900 }}>
      <span className="slabel">006 / CONTACT</span>

      <KineticHeader text="TRANSMIT" />

      <ContactForm />

      {links.length > 0 && (
        <div className="contact-links">
          <span className="c-instr" style={{ marginBottom: 4 }}>
            OR REACH OUT DIRECTLY
          </span>
          {links.map(({ label, href }) => (
            <a
              key={label}
              className="c-link"
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            >
              {label} → {href.replace(/^https?:\/\/(www\.)?/, "").replace(/^mailto:/, "")}
            </a>
          ))}
        </div>
      )}

      <div className="deco" style={{ marginTop: 60 }}>
        TRANSMIT
      </div>
    </div>
  );
}
