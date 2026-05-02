"use client";

import { gtagEvent } from "@/lib/gtag";

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  eventName: string;
  eventLabel?: string;
  eventCategory?: string;
}

/**
 * Drop-in <a> replacement that fires a GA4 event on click.
 *
 * Usage:
 *   <TrackedLink href="..." eventName="resume_download" eventLabel="Hero CTA">
 *     ↓ DOWNLOAD RÉSUMÉ
 *   </TrackedLink>
 */
export default function TrackedLink({
  eventName,
  eventLabel,
  eventCategory = "Engagement",
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    gtagEvent(eventName, {
      event_category: eventCategory,
      event_label: eventLabel ?? eventName,
    });
    onClick?.(e);
  }

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
