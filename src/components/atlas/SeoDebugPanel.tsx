import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

type Tags = {
  canonical: string | null;
  ogUrl: string | null;
  twitterUrl: string | null;
};

function readTags(): Tags {
  if (typeof document === "undefined") {
    return { canonical: null, ogUrl: null, twitterUrl: null };
  }
  const get = (sel: string, attr: string) =>
    document.head.querySelector(sel)?.getAttribute(attr) ?? null;
  return {
    canonical: get('link[rel="canonical"]', "href"),
    ogUrl: get('meta[property="og:url"]', "content"),
    twitterUrl: get('meta[name="twitter:url"]', "content"),
  };
}

export function SeoDebugPanel() {
  const href = useRouterState({ select: (s) => s.location.href });
  const [tags, setTags] = useState<Tags>({ canonical: null, ogUrl: null, twitterUrl: null });
  const [open, setOpen] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only render on dev/preview hosts — never on the published production site.
    const host = window.location.hostname;
    const isProd = host === "lovable-feature-atlas.lovable.app";
    const debugFlag = new URLSearchParams(window.location.search).has("seo-debug");
    setVisible(!isProd || debugFlag);
  }, []);


  useEffect(() => {
    // Wait a tick so TanStack's HeadContent has flushed for the new route.
    const id = window.setTimeout(() => setTags(readTags()), 50);
    return () => window.clearTimeout(id);
  }, [href]);

  const site = "https://lovable-feature-atlas.lovable.app";
  const expected = (() => {
    try {
      const u = new URL(href, site);
      return `${site}${u.pathname}`.replace(/\/+$/, "") || site;
    } catch {
      return site;
    }
  })();

  const row = (label: string, value: string | null) => {
    const ok = value !== null && value.replace(/\/+$/, "") === expected.replace(/\/+$/, "");
    return (
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className={`mt-1 inline-block h-2 w-2 rounded-full ${
            value === null ? "bg-zinc-500" : ok ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</div>
          <div className="truncate font-mono text-[11px] text-zinc-100" title={value ?? "missing"}>
            {value ?? "— missing —"}
          </div>
        </div>
      </div>
    );
  };

  if (!visible) return null;

  return (

    <div className="fixed bottom-4 left-4 z-[60] max-w-[360px]">
      {open ? (
        <div className="rounded-lg border border-zinc-700/80 bg-zinc-950/90 p-3 shadow-xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              SEO debug
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              aria-label="Hide SEO debug panel"
            >
              hide
            </button>
          </div>
          <div className="space-y-2">
            {row("canonical", tags.canonical)}
            {row("og:url", tags.ogUrl)}
            {row("twitter:url", tags.twitterUrl)}
          </div>
          <div className="mt-2 border-t border-zinc-800 pt-2 font-mono text-[10px] text-zinc-500">
            expected: <span className="text-zinc-300">{expected}</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-zinc-700/80 bg-zinc-950/90 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 shadow hover:text-white"
        >
          SEO debug
        </button>
      )}
    </div>
  );
}
