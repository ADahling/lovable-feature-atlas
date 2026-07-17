import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { canonicalUrl } from "../lib/canonical-meta";

const ConstellationView = lazy(() => import("../components/atlas/ConstellationView"));

export const Route = createFileRoute("/constellation")({
  head: () => ({
    meta: [
      { title: "The Constellation, Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "Explore every Lovable feature as a star in a light, interactive paper cosmos clustered by category.",
      },
      {
        property: "og:title",
        content: "The Constellation, Lovable Feature Atlas",
      },
      {
        property: "og:description",
        content:
          "Every Lovable feature as a star in a playful, interactive paper cosmos clustered by category.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl("/constellation") },
      { property: "og:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "The Constellation, Lovable Feature Atlas",
      },
      {
        name: "twitter:description",
        content: "Every Lovable feature as a star in an interactive paper cosmos.",
      },
      { name: "twitter:url", content: canonicalUrl("/constellation") },
      { name: "twitter:image", content: "https://atlas.dahlingdigital.com/og-image.png" },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/constellation") }],
  }),
  component: ConstellationPage,
});

function ConstellationPage() {
  return (
    <main
      className="relative min-h-[100dvh]"
      style={{ backgroundColor: "#F7F1E7", color: "#173F36" }}
    >
      <h1 className="sr-only">The Constellation, Lovable Feature Atlas</h1>
      <Suspense
        fallback={
          <div className="flex h-[100dvh] items-center justify-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#746858]">
              Drawing the cosmos…
            </p>
          </div>
        }
      >
        <ConstellationView />
      </Suspense>
    </main>
  );
}
