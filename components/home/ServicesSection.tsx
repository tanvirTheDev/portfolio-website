import Link from "next/link";
import type { Service } from "@/types/sanity";

const DUMMY_SERVICES: Service[] = [
  {
    _id: "s1",
    _type: "service",
    title: "Web Application Development",
    tagline: "From idea to deployed product",
    icon: "⚡",
    description:
      "Full-stack web apps built with React, Next.js, and Node.js. Scalable architecture, clean code, and on-time delivery.",
    deliverables: ["Responsive UI", "REST or GraphQL API", "Database design", "Deployment"],
    techStack: ["React", "Next.js", "Node.js", "PostgreSQL"],
    startingPrice: "$500+",
    featured: true,
    order: 1,
  },
  {
    _id: "s2",
    _type: "service",
    title: "API & Backend Development",
    tagline: "Fast, reliable, well-documented APIs",
    icon: "//",
    description:
      "REST and GraphQL APIs built to handle real traffic. Authentication, rate limiting, caching, and thorough documentation included.",
    deliverables: ["REST / GraphQL API", "Auth (JWT / OAuth)", "API docs", "Performance tuning"],
    techStack: ["Node.js", "Express", "PostgreSQL", "Redis"],
    startingPrice: "$300+",
    featured: true,
    order: 2,
  },
  {
    _id: "s3",
    _type: "service",
    title: "E-Commerce Solutions",
    tagline: "Stores that convert",
    icon: "◈",
    description:
      "Custom storefronts with payment integration, inventory management, and conversion-focused UX.",
    deliverables: ["Product catalogue", "Checkout + payments", "Admin dashboard", "SEO setup"],
    techStack: ["Next.js", "Stripe", "Sanity CMS", "Tailwind CSS"],
    startingPrice: "$800+",
    featured: true,
    order: 3,
  },
];

interface Props {
  services?: Service[];
}

export default function ServicesSection({ services }: Props) {
  const list = services && services.length > 0 ? services : DUMMY_SERVICES;

  return (
    <section className="services-section">
      {/* Header */}
      <div className="services-hdr">
        <div>
          <span className="slabel" style={{ margin: 0 }}>
            WHAT I BUILD
          </span>
          <h2 className="services-title">SERVICES</h2>
        </div>
        <Link href="/contact" className="btn btn-solid services-cta">
          GET A QUOTE →
        </Link>
      </div>

      {/* Cards */}
      <div className="services-grid">
        {list.map((svc, i) => (
          <div key={svc._id} className="svc-card">
            {/* Top row */}
            <div className="svc-card-top">
              <span className="svc-idx">{String(i + 1).padStart(2, "0")}</span>
              <span className="svc-icon">{svc.icon ?? "◆"}</span>
            </div>

            <h3 className="svc-title">{svc.title}</h3>
            {svc.tagline && <p className="svc-tagline">{svc.tagline}</p>}
            {svc.description && <p className="svc-desc">{svc.description}</p>}

            {/* Deliverables */}
            {svc.deliverables && svc.deliverables.length > 0 && (
              <ul className="svc-deliverables">
                {svc.deliverables.map((d) => (
                  <li key={d}>
                    <span className="svc-check">▸</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}

            {/* Tech stack tags */}
            {svc.techStack && svc.techStack.length > 0 && (
              <div className="svc-tags">
                {svc.techStack.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="svc-footer">
              {svc.startingPrice && <span className="svc-price">{svc.startingPrice}</span>}
              <Link href="/contact" className="svc-contact-btn">
                DISCUSS PROJECT →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
