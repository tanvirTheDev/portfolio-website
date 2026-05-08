import Link from "next/link";

export default function NotFound() {
  return (
    <div className="nf-wrap">
      {/* Big error code */}
      <div className="nf-code">404</div>

      {/* Status line */}
      <div className="nf-status">
        <span className="nf-dot" />
        <span className="nf-status-text">SIGNAL LOST · PAGE NOT FOUND</span>
      </div>

      <p className="nf-msg">
        The file you requested does not exist in this transmission.
        <br />
        Check the path or return to the index.
      </p>

      {/* Nav links */}
      <div className="nf-links">
        <Link href="/" className="nf-btn nf-btn--solid">
          ← RETURN HOME
        </Link>
        <Link href="/work" className="nf-btn">
          VIEW WORK
        </Link>
        <Link href="/contact" className="nf-btn">
          CONTACT
        </Link>
      </div>

      {/* Decorative noise */}
      <div className="nf-noise" aria-hidden />
      <div className="nf-deco">NULL</div>
    </div>
  );
}
