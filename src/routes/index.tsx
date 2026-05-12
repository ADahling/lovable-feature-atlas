import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lovable Feature Atlas — Every feature, beta, and release through May 2026" },
      {
        name: "description",
        content:
          "Interactive dashboard of every Lovable feature: Agent Mode, Plan Mode, prompt queuing, visual edits, GitHub sync, Supabase, browser testing, mobile, beta features and the full release timeline.",
      },
    ],
  }),
});

function Index() {
  return (
    <iframe
      src="/atlas/index.html"
      title="Lovable Feature Atlas"
      style={{ border: 0, width: "100vw", height: "100vh", display: "block" }}
    />
  );
}
