"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page" style={{ paddingTop: 80 }}>
      <span className="slabel">ERROR</span>
      <div className="sec-title" style={{ marginBottom: 24, fontSize: "clamp(32px, 5vw, 72px)" }}>
        SOMETHING
        <br />
        WENT WRONG
      </div>
      <p
        style={{
          fontSize: 10,
          opacity: 0.5,
          letterSpacing: "0.15em",
          marginBottom: 32,
          maxWidth: "50ch",
        }}
      >
        {error.message}
        {error.digest && (
          <span style={{ display: "block", marginTop: 8, opacity: 0.4 }}>
            DIGEST: {error.digest}
          </span>
        )}
      </p>
      <button className="btn" onClick={reset}>
        RETRY
      </button>
    </div>
  );
}
