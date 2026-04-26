"use client";

import Image from "next/image";
import { useState } from "react";
import type { Certificate } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";

export default function CertificatesGrid({ certs }: { certs: Certificate[] }) {
  const [active, setActive] = useState<Certificate | null>(null);

  return (
    <>
      <div className="certs-grid">
        {certs.map((c, i) => (
          <button
            key={c._id}
            className="cert-card"
            onClick={() => setActive(c)}
            aria-label={`Open ${c.name}`}
            data-reveal=""
          >
            <span className="cert-id">CERT-{String(i + 1).padStart(3, "0")}</span>
            <div className="cert-name">{c.name}</div>
            <div className="cert-issuer">{c.issuer}</div>
            <table className="cert-table">
              <tbody>
                {c.date && (
                  <tr>
                    <td>ISSUED</td>
                    <td>{c.date}</td>
                  </tr>
                )}
                <tr>
                  <td>ID</td>
                  <td>{c.credentialId}</td>
                </tr>
              </tbody>
            </table>
            {c.verifyUrl && <span className="cert-verify">VERIFY ↗</span>}
          </button>
        ))}
      </div>

      {/* Modal */}
      {active && (
        <div
          className="modal-bg"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={active.name}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setActive(null)}
              aria-label="Close modal"
            >
              CLOSE ✕
            </button>

            {/* Certificate image or placeholder */}
            {active.image ? (
              <div
                style={{
                  width: "100%",
                  height: 180,
                  position: "relative",
                  marginBottom: 28,
                  border: "1px solid var(--border)",
                }}
              >
                <Image
                  src={urlFor(active.image).width(620).height(360).url()}
                  alt={active.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="620px"
                />
              </div>
            ) : (
              <div className="cert-img">NO IMAGE</div>
            )}

            <span className="cert-id" style={{ fontSize: 9 }}>
              {active.issuer}
            </span>
            <div className="cert-name" style={{ marginBottom: 16 }}>
              {active.name}
            </div>

            <table className="cert-table" style={{ marginBottom: 20 }}>
              <tbody>
                {active.date && (
                  <tr>
                    <td>ISSUED</td>
                    <td>{active.date}</td>
                  </tr>
                )}
                <tr>
                  <td>CREDENTIAL ID</td>
                  <td style={{ wordBreak: "break-all" }}>{active.credentialId}</td>
                </tr>
              </tbody>
            </table>

            {active.verifyUrl && (
              <a
                href={active.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-verify"
                style={{ fontSize: 9, opacity: 1 }}
              >
                VERIFY CREDENTIAL ↗
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
