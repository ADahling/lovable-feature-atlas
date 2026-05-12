import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink text-cream">
      <p className="font-sans text-2xl font-semibold tracking-tight">Atlas loading</p>
    </main>
  );
}
