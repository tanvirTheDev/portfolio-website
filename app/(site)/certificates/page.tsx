import type { Metadata } from "next";
import { getAllCertificates } from "@/lib/sanity/queries";
import CertificatesGrid from "@/components/pages/CertificatesGrid";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const certs = await getAllCertificates();

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <span className="slabel">004 / CERTIFICATES</span>
      <h1 className="sec-title" style={{ marginBottom: 8 }}>
        CREDENTIALS
      </h1>
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
  );
}
