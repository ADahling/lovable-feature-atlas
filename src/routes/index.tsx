import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/atlas/Hero";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "Every Lovable feature, beta, and release through May 2026 — an editorial atlas of the platform.",
      },
    ],
  }),
});

function Index() {
  return <Hero />;
}
