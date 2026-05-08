"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { sendMessage, type ContactState } from "@/app/(site)/contact/actions";
import { gtagEvent } from "@/lib/gtag";

const MAX = 500;
const INITIAL: ContactState = { status: "idle" };

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, INITIAL);
  const [charCount, setCharCount] = useState(0);
  const trackedResult = useRef<string | null>(null);

  const ts = new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";

  // Track form submission result once (success or error)
  useEffect(() => {
    if (state.status === "success" && trackedResult.current !== "success") {
      trackedResult.current = "success";
      gtagEvent("contact_form_success", {
        event_category: "Contact",
        event_label: "Form submitted successfully",
      });
    }
    if (state.status === "error" && trackedResult.current !== "error") {
      trackedResult.current = "error";
      gtagEvent("contact_form_error", {
        event_category: "Contact",
        event_label: state.error ?? "Unknown error",
      });
    }
  }, [state.status, state.error]);

  function handleSubmitClick() {
    // Track every time someone hits TRANSMIT (whether they succeed or not)
    // clack() is handled globally by GlobalClickSound
    gtagEvent("contact_form_submit_attempt", {
      event_category: "Contact",
      event_label: "Transmit button clicked",
      char_count: charCount,
    });
  }

  return (
    <>
      <form action={action}>
        <span className="c-instr">TYPE MESSAGE → PRESS TRANSMIT → RECEIVE CONFIRMATION</span>

        <textarea
          id="msgf"
          name="message"
          placeholder="YOUR MESSAGE. NO FORMALITIES REQUIRED."
          maxLength={MAX}
          required
          defaultValue=""
          onInput={(e) => setCharCount(e.currentTarget.value.length)}
        />

        <div className="send-row">
          <button type="submit" className="send-btn" disabled={pending} onClick={handleSubmitClick}>
            {pending ? "TRANSMITTING…" : "TRANSMIT →"}
          </button>
          <div className="ccount">
            <span>{charCount}</span> / {MAX}
          </div>
        </div>

        {state.status === "error" && (
          <p
            style={{
              marginTop: 12,
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "var(--accent)",
              opacity: 0.7,
            }}
          >
            ERROR: {state.error}
          </p>
        )}
      </form>

      {/* Telegram confirmation */}
      {state.status === "success" && (
        <div className="telegram vis">
          <div className="tg-hdr">
            TELEGRAM RECEIVED · PORTFOLIO · NULL_DEV
            <br />
            TIMESTAMP: {ts}
            <br />
            ORIGIN: CLIENT BROWSER · TRANSMISSION VERIFIED
          </div>
          <div className="tg-body">{state.message}</div>
          <div className="tg-foot">
            MESSAGE RECEIVED AND QUEUED FOR RESPONSE.
            <br />
            EXPECTED REPLY WITHIN 48H.
          </div>
        </div>
      )}
    </>
  );
}
