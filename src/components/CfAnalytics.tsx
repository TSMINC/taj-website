import Script from "next/script";

/**
 * Cloudflare Web Analytics beacon.
 *
 * Reads NEXT_PUBLIC_CF_ANALYTICS_TOKEN at build time. When unset (local dev
 * or before Taj enables analytics in CF dashboard) the component renders
 * nothing — zero network calls, zero overhead. When set, the beacon loads
 * asynchronously after page load. No cookies, no PII.
 *
 * Enable: dash.cloudflare.com -> Analytics & Logs -> Web Analytics ->
 * Add a site -> copy the beacon token -> paste into Pages env vars as
 * NEXT_PUBLIC_CF_ANALYTICS_TOKEN. Redeploy.
 */
export function CfAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN ?? "";
  if (!token) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
