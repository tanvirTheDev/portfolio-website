import type { Testimonial } from "@/types/sanity";

const DUMMY_TESTIMONIALS: Testimonial[] = [
  {
    _id: "t1",
    _type: "testimonial",
    clientName: "Sarah M.",
    clientTitle: "Product Manager",
    clientCompany: "USA",
    quote:
      "Tanvir delivered our web app ahead of schedule and beyond spec. Communication was perfect throughout. Will hire again without question.",
    platform: "upwork",
    rating: 5,
    featured: true,
    order: 1,
  },
  {
    _id: "t2",
    _type: "testimonial",
    clientName: "David K.",
    clientTitle: "CTO",
    clientCompany: "UK",
    quote:
      "Exceptional backend work. The API is clean, well-documented, and handles 10x the traffic we originally planned for. Exactly what we needed.",
    platform: "upwork",
    rating: 5,
    featured: true,
    order: 2,
  },
  {
    _id: "t3",
    _type: "testimonial",
    clientName: "Lena R.",
    clientTitle: "Founder",
    clientCompany: "Germany",
    quote:
      "Best freelancer I've worked with on Upwork. Tanvir understands both the technical and business side. The e-commerce store he built increased our sales by 40%.",
    platform: "upwork",
    rating: 5,
    featured: true,
    order: 3,
  },
];

const PLATFORM_LABELS: Record<string, string> = {
  upwork: "UPWORK",
  linkedin: "LINKEDIN",
  direct: "DIRECT",
  other: "CLIENT",
};

const PLATFORM_COLORS: Record<string, string> = {
  upwork: "#14a800",
  linkedin: "#0a66c2",
  direct: "var(--accent)",
  other: "var(--fg)",
};

interface Props {
  testimonials?: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: Props) {
  const list = testimonials && testimonials.length > 0 ? testimonials : DUMMY_TESTIMONIALS;

  return (
    <section className="testimonials-section">
      <div className="testimonials-hdr">
        <span className="slabel" style={{ margin: 0 }}>
          SOCIAL PROOF
        </span>
        <h2 className="testimonials-title">CLIENT REVIEWS</h2>
      </div>

      <div className="testimonials-grid">
        {list.map((t, i) => {
          const platform = t.platform ?? "upwork";
          const platformLabel = PLATFORM_LABELS[platform] ?? "CLIENT";
          const platformColor = PLATFORM_COLORS[platform] ?? "var(--accent)";
          const rating = t.rating ?? 5;

          return (
            <div key={t._id} className="testi-card">
              {/* Index + platform badge */}
              <div className="testi-top">
                <span className="testi-idx">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className="testi-platform"
                  style={{ color: platformColor, borderColor: platformColor }}
                >
                  {platformLabel}
                </span>
              </div>

              {/* Stars */}
              <div className="testi-stars">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si} className="testi-star" style={{ opacity: si < rating ? 1 : 0.18 }}>
                    ★
                  </span>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="testi-quote">&ldquo;{t.quote}&rdquo;</blockquote>

              {/* Client info */}
              <div className="testi-client">
                {t.clientPhoto?.asset?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.clientPhoto.asset.url} alt={t.clientName} className="testi-avatar" />
                ) : (
                  <div className="testi-avatar-ph">{t.clientName.charAt(0).toUpperCase()}</div>
                )}
                <div className="testi-client-info">
                  <span className="testi-name">{t.clientName}</span>
                  {(t.clientTitle || t.clientCompany) && (
                    <span className="testi-meta">
                      {[t.clientTitle, t.clientCompany].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
