// Global command-palette wiring. The SEARCH nav item, the hero search
// affordance, and the /search route all open the same overlay (the Oracle)
// through this event, so there is exactly one search surface site-wide.
//
// The pending flag makes the request durable: on a direct /search load the
// route's effect fires before the Oracle (a later sibling in the tree) has
// registered its listener, so the Oracle also checks the flag on mount.
export const OPEN_PALETTE_EVENT = "atlas:open-palette";

let pendingOpen = false;

export function openPalette(): void {
  if (typeof window === "undefined") return;
  pendingOpen = true;
  window.dispatchEvent(new CustomEvent(OPEN_PALETTE_EVENT));
}

/** Returns true (once) if an open request was made before a listener existed. */
export function consumePendingPaletteOpen(): boolean {
  const had = pendingOpen;
  pendingOpen = false;
  return had;
}
