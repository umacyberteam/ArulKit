"use client";

import Script from "next/script";

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || "default";

/**
 * Loads the Tawk.to live chat widget globally. Used for feedback, bug
 * reports, and feature requests (see components/home/suggest-tool.tsx, which
 * opens this same widget with a prefilled message).
 *
 * Renders nothing if NEXT_PUBLIC_TAWKTO_PROPERTY_ID isn't configured, so the
 * site still works fully before Tawk.to is set up.
 */
export function TawkTo() {
  if (!PROPERTY_ID) return null;

  return (
    <Script
      id="tawkto-embed"
      strategy="afterInteractive"
      src={`https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`}
      crossOrigin="anonymous"
    />
  );
}
