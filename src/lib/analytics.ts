/**
 * Analytics — thin, safe wrapper around Plausible custom events.
 *
 * The loader script lives in __root.tsx (plausible.io, cookieless — no
 * consent banner needed, and it keeps the quiz's "no account, no tracking"
 * promise honest: no cookies, no fingerprinting, no personal identifiers).
 *
 * Rules:
 *  - Never throw: analytics must never break the app.
 *  - SSR no-op: only fires in the browser.
 *  - If the script is blocked or absent, calls silently do nothing.
 */

type EventProps = Record<string, string | number | boolean | undefined>;

interface PlausibleWindow {
  plausible?: (name: string, options?: { props?: EventProps }) => void;
}

export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as PlausibleWindow;
    // Drop undefined values so dashboards stay clean.
    const clean: EventProps | undefined = props
      ? Object.fromEntries(
          Object.entries(props).filter(([, v]) => v !== undefined),
        )
      : undefined;
    w.plausible?.(name, clean && Object.keys(clean).length ? { props: clean } : undefined);
  } catch {
    /* never break the app for analytics */
  }
}
