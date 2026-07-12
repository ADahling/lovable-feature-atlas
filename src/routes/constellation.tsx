import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { canonicalUrl } from "../lib/canonical-meta";

const ConstellationView = lazy(
  () => import("../components/atlas/ConstellationView"),
);

export const Route = createFileRoute("/constellation")({
  head: () => ({
    meta: [
      { title: "The Constellation, Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "Every Lovable feature as a star in an interactive 3D sky. Orbit, zoom, and click any star to open its feature page.",
      },
      {
        property: "og:title",
        content: "The Constellation, Lovable Feature Atlas",
      },
      {
        property: "og:description",
        content:
          "Every Lovable feature as a star in an interactive 3D sky, clustered by category.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl("/constellation") },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "The Constellation, Lovable Feature Atlas",
      },
      {
        name: "twitter:description",
        content:
          "Every Lovable feature as a star in an interactive 3D sky.",
      },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/constellation") }],
  }),
  component: ConstellationPage,
});

function ConstellationPage() {
  return (
    <main className="relative min-h-[100dvh]" style={{ backgroundColor: "#0A0A0A", color: "#FBF5E9" }}>
      <h1 className="sr-only">The Constellation, Lovable Feature Atlas</h1>
      <Suspense
        fallback={
          <div className="flex h-[100dvh] items-center justify-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cream/50">
              Loading the sky…
            </p>
          </div>
        }
      >
        <ConstellationView />
      </Suspense>
    </main>
  );
}
