import * as React from "react";

/**
 * Normalized tilt input: x / y in the range [-1, 1] representing how far
 * the user has "tilted" via device orientation (mobile) or pointer
 * position (desktop). Consumers translate this into subtle parallax
 * offsets, camera rotation, or card tilt.
 *
 * On iOS the DeviceOrientation API requires an explicit user gesture to
 * request permission — this hook exposes `permissionState` and
 * `requestPermission()` so surfaces can render a subtle "enable tilt"
 * affordance only when relevant. On desktops without orientation
 * sensors, `source` reports "pointer" and the hook falls back silently
 * to pointer-driven parallax scoped to the given element (or window).
 *
 * Respects prefers-reduced-motion by pinning tilt to zero.
 */
export type TiltPermission = "unknown" | "unsupported" | "prompt" | "granted" | "denied";

export interface Tilt {
  x: number;
  y: number;
  source: "orientation" | "pointer" | "none";
  permissionState: TiltPermission;
  requestPermission: () => Promise<void>;
}

interface UseTiltParallaxOptions {
  /** Max tilt magnitude the sensor is scaled to (degrees). */
  range?: number;
  /** Element for pointer fallback. Defaults to window. */
  target?: React.RefObject<HTMLElement | null>;
  /** Disable pointer fallback (e.g. touch-only surfaces). */
  pointer?: boolean;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function useTiltParallax(options: UseTiltParallaxOptions = {}): Tilt {
  const { range = 22, target, pointer = true } = options;
  const [tilt, setTilt] = React.useState<{ x: number; y: number; source: Tilt["source"] }>(
    { x: 0, y: 0, source: "none" },
  );
  const [permissionState, setPermissionState] = React.useState<TiltPermission>("unknown");

  const hasOrientationApi = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return "DeviceOrientationEvent" in window;
  }, []);

  const needsPermission = React.useMemo(() => {
    if (!hasOrientationApi) return false;
    const anyEvt = (window as unknown as {
      DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
    }).DeviceOrientationEvent;
    return typeof anyEvt?.requestPermission === "function";
  }, [hasOrientationApi]);

  React.useEffect(() => {
    if (!hasOrientationApi) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState(needsPermission ? "prompt" : "granted");
  }, [hasOrientationApi, needsPermission]);

  const requestPermission = React.useCallback(async () => {
    if (!needsPermission) return;
    try {
      const evt = (window as unknown as {
        DeviceOrientationEvent: { requestPermission: () => Promise<string> };
      }).DeviceOrientationEvent;
      const result = await evt.requestPermission();
      setPermissionState(result === "granted" ? "granted" : "denied");
    } catch {
      setPermissionState("denied");
    }
  }, [needsPermission]);

  React.useEffect(() => {
    if (prefersReducedMotion()) return;
    if (permissionState !== "granted") return;

    let raf = 0;
    let latest: DeviceOrientationEvent | null = null;
    const onOrient = (e: DeviceOrientationEvent) => {
      latest = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!latest) return;
        // gamma = left/right tilt (-90..90); beta = front/back (-180..180).
        const gx = (latest.gamma ?? 0) / range;
        const gy = ((latest.beta ?? 0) - 45) / range; // rest around 45° portrait
        setTilt({
          x: Math.max(-1, Math.min(1, gx)),
          y: Math.max(-1, Math.min(1, gy)),
          source: "orientation",
        });
      });
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [permissionState, range]);

  React.useEffect(() => {
    if (!pointer) return;
    if (prefersReducedMotion()) return;
    if (tilt.source === "orientation") return;
    // Skip pointer fallback on touch-primary devices.
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches) return;

    const el = target?.current ?? null;
    const node: HTMLElement | Window = el ?? window;
    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const handle = (px: number, py: number) => {
      const rect =
        el?.getBoundingClientRect() ??
        ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } as DOMRect);
      const nx = ((px - rect.left) / rect.width) * 2 - 1;
      const ny = ((py - rect.top) / rect.height) * 2 - 1;
      pending = { x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (pending) setTilt({ ...pending, source: "pointer" });
      });
    };
    const onMove = (e: Event) => {
      const me = e as MouseEvent;
      handle(me.clientX, me.clientY);
    };
    node.addEventListener("mousemove", onMove as EventListener, { passive: true });
    return () => {
      node.removeEventListener("mousemove", onMove as EventListener);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pointer, target, tilt.source]);

  return { ...tilt, permissionState, requestPermission };
}
