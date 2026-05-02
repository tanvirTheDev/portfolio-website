import type { Metadata } from "next";
import { getAllCertificates } from "@/lib/sanity/queries";
import CertificatesGrid from "@/components/pages/CertificatesGrid";
import KineticTitleLoader from "@/components/physics/KineticTitleLoader";

export const metadata: Metadata = {
  title: "Certificates — Tanvir Ahmed",
  description:
    "Verified professional certifications in web development, cloud computing, and computer science.",
  openGraph: {
    title: "Certificates — Tanvir Ahmed",
    description:
      "Verified professional certifications in web development, cloud computing, and computer science.",
    type: "website",
  },
};

export default async function CertificatesPage() {
  const certs = await getAllCertificates();

  return (
    <div>
      {/* ── PHYSICS STAGE ── */}
      <KineticTitleLoader text="CREDENTIALS" label="004 / CERTIFICATES" />

      {/* ── CERTIFICATES CONTENT ── */}
      <div className="page" style={{ paddingTop: 48 }}>
        <p
          style={{
            fontSize: 9,
            opacity: 0.28,
            letterSpacing: "0.2em",
            marginBottom: 32,
            textTransform: "uppercase",
          }}
        >
          {certs.length} VERIFIED · CLICK TO INSPECT
        </p>

        {certs.length === 0 ? (
          <p style={{ opacity: 0.3, fontSize: 11, letterSpacing: "0.2em" }}>
            NO CERTIFICATES YET — ADD VIA /STUDIO
          </p>
        ) : (
          <CertificatesGrid certs={certs} />
        )}

        <div className="deco" style={{ marginTop: 40 }}>
          CERTIFIED
        </div>
      </div>
    </div>
  );
}
