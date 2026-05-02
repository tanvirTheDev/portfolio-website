/**
 * Google Analytics 4 — typed event helper
 *
 * Usage:
 *   gtagEvent('contact_form_success', { method: 'email' })
 *   gtagEvent('resume_download')
 *   gtagEvent('cta_click', { label: 'VIEW_WORK' })
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5HLMGC95PB";

type GtagEventParams = Record<string, string | number | boolean | undefined>;

export function gtagEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
