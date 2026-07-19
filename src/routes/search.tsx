import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { openPalette } from "../lib/palette";

// SEARCH is a palette, not a page — but the URL must never 404. Landing
// here opens the command palette over a small ivory stage that also works
// without JavaScript (the fallback links go to the filterable catalog).
// noindex convention: no canonical/og:url/twitter:url tags, and the route
// is excluded from sitemap.xml.
export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({
    meta: [
      { title: "Search — The Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "Search every Lovable feature, beta, and release in the Atlas catalog.",
      },
      // Utility surface: reachable, never indexed (the catalog is canonical).
      { name: "robots", content: "noindex, follow" },
    ],
  }),
});

function SearchPage() {
  useEffect(() => {
    openPalette();
  }, []);

  return (
    <main className="relative flex min-h-[70vh] flex-col items-center justify-center bg-ink px-5 text-center text-cream">
      <p className="t-eyebrow text-gold">The search desk</p>
      <h1 className="t-title mt-3 text-cream">Ask for any feature.</h1>
      <button
        type="button"
        onClick={openPalette}
        className="mt-8 inline-flex w-full max-w-md items-center gap-3 rounded-md border border-line bg-muted-ink px-4 py-3.5 text-left font-mono text-[13px] text-cream/70 transition-colors hover:border-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
      >
        <Search className="size-4 text-gold" aria-hidden />
        Search the catalog…
        <kbd className="ml-auto rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-cream/55">
          ⌘K
        </kbd>
      </button>
      <p className="t-body-sm mt-8 text-cream/70">
        Prefer browsing?{" "}
        <Link to="/" hash="catalog" className="text-gold underline underline-offset-4">
          Open the full catalog
        </Link>{" "}
        with filters, list view, and the timeline.
      </p>
    </main>
  );
}
