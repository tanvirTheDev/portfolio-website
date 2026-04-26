import type { Metadata } from "next";
import KineticHeader from "@/components/ui/KineticHeader";
import ContactForm from "@/components/pages/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="page" style={{ paddingTop: 60, maxWidth: 900 }}>
      <span className="slabel">006 / CONTACT</span>

      <KineticHeader text="TRANSMIT" />

      <ContactForm />

      <div className="deco" style={{ marginTop: 60 }}>
        TRANSMIT
      </div>
    </div>
  );
}
