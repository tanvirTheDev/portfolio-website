import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/sanity/queries";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";
import TrackedLink from "@/components/ui/TrackedLink";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Tanvir Ahamed — full-stack developer known as tanvirthedev. Background, skills, and professional story.",
  keywords: [
    "Tanvir Ahamed",
    "tanvirthedev",
    "tanvir the dev",
    "tanvir ahamed developer",
    "tanvir ahamed full stack",
    "tanvir ahamed react",
    "tanvir ahamed next.js",
    "tanvir ahamed upwork",
    "about tanvir",
  ],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Tanvir Ahamed — Full-Stack Developer",
    description:
      "About Tanvir Ahamed — full-stack developer known as tanvirthedev. React, Next.js, Node.js specialist available for freelance work.",
    type: "profile",
    url: `${SITE_URL}/about`,
  },
};

export default async function AboutPage() {
  const settings = await getSiteSettings().catch(() => null);

  const name = settings?.name ?? "Tanvir Ahamed";
  const tagline = settings?.tagline ?? "Full-Stack Developer";

  // JSON-LD — rich Person schema specifically for the About page
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: name,
    alternateName: ["tanvirthedev", "Tanvir the Dev", "tanvir ahamed developer"],
    url: SITE_URL,
    sameUrl: `${SITE_URL}/about`,
    jobTitle: tagline,
    description:
      "Tanvir Ahamed is a full-stack developer specialising in React, Next.js, Node.js, and TypeScript. Known online as tanvirthedev. Available for freelance work on Upwork.",
    knowsAbout: [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "JavaScript",
      "REST API",
      "PostgreSQL",
      "MongoDB",
      "Tailwind CSS",
      "Docker",
      "Vercel",
    ],
    sameAs: [
      settings?.githubUrl ?? "https://github.com/tanvirTheDev",
      settings?.linkedinUrl,
      settings?.upworkUrl ?? "https://www.upwork.com/freelancers/tanvirthedev",
      settings?.twitterUrl,
      settings?.mediumUsername ? `https://medium.com/@${settings.mediumUsername}` : null,
      settings?.devCommunityUrl,
      settings?.leetcodeUrl,
      settings?.codeforcesUrl,
    ].filter(Boolean),
    ...(settings?.email && { email: `mailto:${settings.email}` }),
    ...(settings?.profileImage?.asset?.url && { image: settings.profileImage.asset.url }),
  };

  const skills = [
    {
      group: "FRONTEND",
      items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    },
    { group: "BACKEND", items: ["Node.js", "Express", "REST API", "GraphQL", "WebSockets"] },
    { group: "DATABASE", items: ["PostgreSQL", "MongoDB", "Sanity CMS", "Prisma"] },
    { group: "TOOLS", items: ["Git", "Docker", "Vercel", "AWS", "Phaser", "Three.js"] },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <KineticTitleLoader text="ABOUT" label="008 / ABOUT" />

      <div className="page" style={{ paddingTop: 48, maxWidth: 860 }}>
        {/* ── IDENTITY BLOCK ── */}
        <div className="about-identity" data-reveal="">
          {settings?.profileImage?.asset?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.profileImage.asset.url} alt={name} className="about-photo" />
          )}
          <div className="about-identity-text">
            <h1 className="about-name">{name}</h1>
            <p className="about-aka">
              Also known as <span className="about-alias">tanvirthedev</span>
              {" · "}
              <span className="about-alias">Tanvir the Dev</span>
            </p>
            <p className="about-role">{tagline}</p>
          </div>
        </div>

        {/* ── BIO ── */}
        <div className="about-section" data-reveal="">
          <div className="about-sec-label">BIOGRAPHY</div>
          <div className="about-bio">
            <p>
              <strong>Tanvir Ahamed</strong> is a full-stack developer and freelancer, widely known
              online as <strong>tanvirthedev</strong> or <strong>Tanvir the Dev</strong>. He builds
              production-grade web applications using React, Next.js, Node.js, and TypeScript.
            </p>
            <p>
              Tanvir Ahamed specialises in turning complex requirements into clean, scalable code.
              From high-performance APIs to pixel-precise frontends — he covers the full stack. His
              work spans SaaS platforms, e-commerce solutions, real-time applications, and developer
              tooling.
            </p>
            <p>
              As a freelancer on Upwork, Tanvir Ahamed has worked with clients from multiple
              countries, consistently delivering projects on time with clear communication. He is
              available for both short-term contracts and long-term remote engagements.
            </p>
            <p>
              Outside of client work, Tanvir Ahamed publishes technical articles on Medium,
              contributes to open source, and builds personal projects that push the boundaries of
              what web technology can do — including a browser-based space shooter game built with
              Phaser 4.
            </p>
          </div>
        </div>

        {/* ── SKILLS ── */}
        <div className="about-section" data-reveal="">
          <div className="about-sec-label">SKILLS · EXPERTISE</div>
          <div className="about-skills">
            {skills.map(({ group, items }) => (
              <div key={group} className="about-skill-group">
                <div className="about-skill-group-label">{group}</div>
                <div className="about-skill-tags">
                  {items.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FIND ME ── */}
        <div className="about-section" data-reveal="">
          <div className="about-sec-label">FIND TANVIR AHAMED ONLINE</div>
          <p className="about-find-note">
            Searching for <em>Tanvir Ahamed</em> or <em>tanvirthedev</em>? You&apos;ve found the
            right place. Here are all official profiles:
          </p>
          <div className="about-links">
            {settings?.upworkUrl && (
              <TrackedLink
                href={settings.upworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_upwork_click"
                eventCategory="About"
              >
                <span className="about-link-label">UPWORK</span>
                <span className="about-link-val">Hire Tanvir Ahamed →</span>
              </TrackedLink>
            )}
            {settings?.githubUrl && (
              <TrackedLink
                href={settings.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_github_click"
                eventCategory="About"
              >
                <span className="about-link-label">GITHUB</span>
                <span className="about-link-val">tanvirTheDev →</span>
              </TrackedLink>
            )}
            {settings?.linkedinUrl && (
              <TrackedLink
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_linkedin_click"
                eventCategory="About"
              >
                <span className="about-link-label">LINKEDIN</span>
                <span className="about-link-val">Tanvir Ahamed →</span>
              </TrackedLink>
            )}
            {settings?.mediumUsername && (
              <TrackedLink
                href={`https://medium.com/@${settings.mediumUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_medium_click"
                eventCategory="About"
              >
                <span className="about-link-label">MEDIUM</span>
                <span className="about-link-val">Technical articles →</span>
              </TrackedLink>
            )}
            {settings?.twitterUrl && (
              <TrackedLink
                href={settings.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_twitter_click"
                eventCategory="About"
              >
                <span className="about-link-label">TWITTER / X</span>
                <span className="about-link-val">@tanvirthedev →</span>
              </TrackedLink>
            )}
            {settings?.leetcodeUrl && (
              <TrackedLink
                href={settings.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_leetcode_click"
                eventCategory="About"
              >
                <span className="about-link-label">LEETCODE</span>
                <span className="about-link-val">Problem solving →</span>
              </TrackedLink>
            )}
            {settings?.codeforcesUrl && (
              <TrackedLink
                href={settings.codeforcesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_codeforces_click"
                eventCategory="About"
              >
                <span className="about-link-label">CODEFORCES</span>
                <span className="about-link-val">Competitive programming →</span>
              </TrackedLink>
            )}
            {settings?.devCommunityUrl && (
              <TrackedLink
                href={settings.devCommunityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                eventName="about_devto_click"
                eventCategory="About"
              >
                <span className="about-link-label">DEV.TO</span>
                <span className="about-link-val">Dev community →</span>
              </TrackedLink>
            )}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="about-cta" data-reveal="">
          <Link href="/work" className="btn btn-solid">
            VIEW PROJECTS
          </Link>
          <Link href="/contact" className="btn">
            HIRE TANVIR AHAMED
          </Link>
        </div>

        <div className="deco" style={{ marginTop: 60 }}>
          TANVIR AHAMED
        </div>
      </div>
    </div>
  );
}
