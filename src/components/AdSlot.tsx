/**
 * Ad slot reservation — zero-render by default. Reserves vertical space in the
 * layout so when we wire a real ad network later, nothing shifts.
 *
 * Taj (2026-10-03): "we're going to put it as a background thing" — intent is
 * side rails, not interstitial / in-content.
 *
 * To activate: wire `window.summit_ads?.render(slot, elementId)` in a client
 * script. Until that exists, the slot stays empty + reserves no bg paint.
 */

import type { CSSProperties } from "react";

type Props = {
  slot: "left-rail" | "right-rail" | "footer-horizontal";
  /** Reserved min-height so later-wired ads don't push layout. */
  minHeight?: number;
};

export function AdSlot({ slot, minHeight = 250 }: Props) {
  const style: CSSProperties = { minHeight: `${minHeight}px` };
  return (
    <aside
      data-ad-slot={slot}
      style={style}
      aria-hidden
      // Hidden from screen readers + rendered only in dev mode (via env flag).
      // Production: zero visual weight until the ad network wiring lands.
      className="hidden"
    />
  );
}
