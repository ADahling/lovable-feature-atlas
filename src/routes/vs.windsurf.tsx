import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Minus } from "lucide-react";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { LOVABLE_AFFILIATE_HREF } from "../lib/category-theme";

const PATH = "/vs/windsurf";
const TITLE = "Lovable vs Windsurf (2026): Honest Comparison, Lovable Feature Atlas";
const DESCRIPTION =
  "An independent comparison of Lovable and the Windsurf IDE: who each is for, agent autonomy, cloud vs local, backend and deploy, and where each tool actually shines.";
const UPDATED = "2026-07-20";

interface Faq {
  q: string;
  a: string;
}
const FAQS: Faq[] = [
  {
    q: "Is Lovable better than Windsurf?",
    a: "They solve different problems. Windsurf is a desktop IDE with a Cascade agent that edits files in your local repository, close to the metal for developers who already work in an editor. Lovable is a browser-based full-stack builder with an autonomous agent that scaffolds UI, database, auth, hosting, and deploy from a prompt. If you live in a code editor, Windsurf slots in. If you want an app that ships with a real backend, hosting, and a shared preview URL on day one, Lovable is the shorter path.",
  },
  {
    q: "Do I need to know how to code to use Lovable or Windsurf?",
    a: "Lovable is designed for non-developers as much as developers; you can go from prompt to running app without opening a terminal, and the code is standard React and TypeScript when you want it. Windsurf is a full IDE aimed at developers; the agent helps, but you're still expected to read and edit code.",
  },
  {
    q: "Which one has a real backend and hosting?",
    a: "Lovable does, out of the box. Lovable Cloud bundles Postgres, auth, storage, and edge functions with the plan, and the app is hosted on a stable URL you can point a custom domain at. Windsurf is an editor; the backend, database, and hosting are whatever you wire up on your own machine and cloud accounts.",
  },
  {
    q: "Which one has a more autonomous agent?",
    a: "Lovable's Agent Mode is designed to plan and execute multi-step changes across the full stack, including schema migrations and edge functions, without asking for permission at every step. Windsurf's Cascade agent is strong at multi-file refactors inside a local repo, but stays inside the editor surface and the code you already have.",
  },
];

interface Row {
  dimension: string;
  lovable: string;
  windsurf: string;
}
const ROWS: Row[] = [
  {
    dimension: "Who it's for",
    lovable: "Founders, PMs, designers, and developers who want to ship and keep running a real product.",
    windsurf: "Developers who already work in a code editor and want an AI agent living inside it.",
  },
  {
    dimension: "Where it runs",
    lovable: "Browser. A live preview updates in place as the agent works.",
    windsurf: "Desktop IDE (VS Code fork). Runs against files on your local machine.",
  },
  {
    dimension: "How you build",
    lovable: "Chat with an agent that scaffolds UI, database, auth, and deploy, iterating in a live preview.",
    windsurf: "Open a repo, prompt Cascade, review and accept edits across files in the editor.",
  },
  {
    dimension: "Backend and hosting",
    lovable: "Lovable Cloud (Postgres, auth, storage, edge functions) and hosting are included in the plan.",
    windsurf: "None built in. You bring your own database, hosting, and deploy pipeline.",
  },
  {
    dimension: "Agent autonomy",
    lovable: "Agent Mode plans and executes multi-step changes across the stack, including schema and functions.",
    windsurf: "Cascade agent runs multi-file edits inside the repo, closer to a supervised pair-programmer.",
  },
  {
    dimension: "Code ownership and export",
    lovable: "Standard React and TypeScript; GitHub Sync gives you a real, two-way-synced repository.",
    windsurf: "You own the local repo from the start; nothing to export.",
  },
  {
    dimension: "Collaboration",
    lovable: "Multiplayer editing, share links, workspace roles, and a public preview URL.",
    windsurf: "Whatever your git host provides; the IDE itself is single-player.",
  },
  {
    dimension: "Pricing model",
    lovable: "Tiered plans that meter AI usage; hosting and backend included.",
    windsurf: "Per-seat editor subscription metered by agent credits; you pay for infra separately.",
  },
  {
    dimension: "Best at",
    lovable: "Turning an idea into a running, hosted app with a real database and auth.",
    windsurf: "Making an existing codebase faster to navigate, refactor, and extend.",
  },
];

const CHOOSE_LOVABLE = [
  "You want a running, hosted app with a real database and auth on day one.",
  "You want an agent that can plan and execute multi-step changes across the stack.",
  "You want hosting, backend, and deployment on one bill instead of five.",
  "You want non-developers on your team to ship real changes without a local dev setup.",
];

const CHOOSE_WINDSURF = [
  "You already live in a desktop code editor and don't want to leave it.",
  "You're extending an existing codebase where the value is in local files and git history.",
  "You want an AI pair-programmer more than an autonomous end-to-end builder.",
  "Your backend, database, and hosting are already set up the way you like them.",
];

const RELATED: Array<{ slug: string; label: string; note: string }> = [
  { slug: "lovable-cloud", label: "Lovable Cloud", note: "Bundled Postgres, auth, storage, and edge functions, the thing Windsurf does not include." },
  { slug: "agent-mode", label: "Agent Mode", note: "Autonomous, end-to-end execution of multi-step changes across the stack." },
  { slug: "github-sync", label: "GitHub Sync", note: "Two-way sync to a real repository you own, so you can drop into an IDE like Windsurf when you want to." },
  { slug: "lovable-api", label: "Lovable API", note: "Programmatic access to build and edit Lovable projects from your own code." },
];

export const Route = createFileRoute("/vs/windsurf")({
  head: () => {
    const canonical = buildCanonicalTags({ path: PATH });
    const image = `${SITE_ORIGIN}/og-image.png`;
    const url = canonicalUrl(PATH);
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "article" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        { name: "twitter:image", content: image },
        { name: "author", content: "Alicia Dahling" },
        ...canonical.meta,
      ],
      links: canonical.links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: "Lovable vs Windsurf: which one fits how you build?",
            description: DESCRIPTION,
            url,
            datePublished: UPDATED,
            dateModified: UPDATED,
            inLanguage: "en",
            author: {
              "@type": "Person",
              name: "Alicia Dahling",
              url: "https://www.linkedin.com/in/alicia-dahling-mba-macc/",
            },
            publisher: {
              "@type": "Organization",
              name: "The Lovable Feature Atlas",
              url: SITE_ORIGIN,
            },
            mainEntityOfPage: url,
            about: [
              { "@type": "SoftwareApplication", name: "Lovable" },
              { "@type": "SoftwareApplication", name: "Windsurf" },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: VsWindsurfPage,
});

function VsWindsurfPage() {
  return (
    <main className="relative w-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(11,61,46,0.55) 0%, rgba(31,122,90,0.28) 45%, rgba(201,169,97,0.12) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
        }}
      />

      <article className="relative mx-auto flex w-full max-w-5xl flex-col gap-16 px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <Link
          to="/"
          className="t-label inline-flex w-fit items-center gap-2 text-cream/60 transition-colors hover:text-cream"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to the atlas
        </Link>

        <header className="flex flex-col gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
            Comparisons · Updated July 2026
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl md:text-6xl">
            Lovable vs Windsurf: which one fits how you build?
          </h1>
          <p className="t-body-lg max-w-3xl text-cream/85">
            Windsurf is a desktop IDE with a Cascade agent that edits your local repo. Lovable
            is a browser-based full-stack app builder that ships a running app with a real
            database, auth, hosting, and an autonomous agent, from a prompt.
          </p>
          <p className="t-body-sm text-cream/55">
            Written from the atlas's independent-catalog voice. Not a hit piece; not a sales
            page. Every Lovable claim is grounded in a feature that exists in the catalog.
          </p>
        </header>

        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Local IDE agent vs cloud full-stack builder
          </h2>
          <p className="t-body text-cream/85">
            Windsurf and Lovable both put an agent in front of you, but the surface is
            different. Windsurf is a fork of VS Code. Cascade lives inside the editor, opens
            the files you're working on, and edits them in place. It shines on an existing
            repository where the win is speed of navigation, refactor, and multi-file edits.
          </p>
          <p className="t-body text-cream/85">
            Lovable starts one level up. You describe an app in the browser and the agent
            scaffolds the UI, provisions Postgres, wires auth, deploys, and hands you a live
            preview URL. When you're ready for a real IDE, GitHub Sync gives you a
            two-way-synced repo you can open in Windsurf, or anywhere else.
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              At a glance
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/45">
              {ROWS.length} dimensions
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-cream/10">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-cream/10 bg-cream/[0.02]">
                  <th
                    scope="col"
                    className="w-[26%] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55"
                  >
                    Dimension
                  </th>
                  <th
                    scope="col"
                    className="w-[37%] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald"
                  >
                    Lovable
                  </th>
                  <th
                    scope="col"
                    className="w-[37%] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-gold"
                  >
                    Windsurf
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.dimension}
                    className={
                      "align-top " +
                      (i < ROWS.length - 1 ? "border-b border-cream/[0.06]" : "")
                    }
                  >
                    <th
                      scope="row"
                      className="px-4 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/70"
                    >
                      {row.dimension}
                    </th>
                    <td className="px-4 py-4 text-[14px] leading-relaxed text-cream/85">
                      {row.lovable}
                    </td>
                    <td className="px-4 py-4 text-[14px] leading-relaxed text-cream/85">
                      {row.windsurf}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-3 rounded-lg border border-emerald/25 bg-emerald/[0.04] p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              Choose Lovable if
            </h2>
            <ul className="flex flex-col gap-3">
              {CHOOSE_LOVABLE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-cream/85">
                  <Check className="mt-1 size-3.5 shrink-0 text-emerald" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-gold/25 bg-gold/[0.04] p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Choose Windsurf if
            </h2>
            <ul className="flex flex-col gap-3">
              {CHOOSE_WINDSURF.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-cream/85">
                  <Minus className="mt-1 size-3.5 shrink-0 text-gold" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            What many teams actually do
          </h2>
          <p className="t-body-lg text-cream/90">
            Ship in Lovable, extend in Windsurf.
          </p>
          <p className="t-body text-cream/85">
            Because Lovable projects are standard React and TypeScript with GitHub Sync, the
            common pattern is to prompt the app into existence in Lovable, then open the same
            repo in Windsurf when you want deep, keyboard-driven refactors. You get the
            speed-to-first-app of a cloud builder and the local-IDE ergonomics on the same
            codebase.
          </p>
        </section>

        <section className="flex flex-col gap-6 border-t border-cream/10 pt-10">
          <div className="flex flex-col gap-2">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              Supporting evidence from the catalog
            </h2>
            <p className="t-body-sm text-cream/60">
              Every Lovable capability referenced above has its own entry in the atlas.
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {RELATED.map((r) => (
              <li key={r.slug}>
                <Link
                  to="/features/$slug"
                  params={{ slug: r.slug }}
                  className="group block h-full rounded-lg border border-cream/10 bg-cream/[0.02] p-5 transition-colors hover:border-emerald/40 hover:bg-emerald/[0.04]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg text-cream group-hover:text-emerald transition-colors">
                      {r.label}
                    </span>
                    <ArrowRight
                      className="size-4 text-cream/40 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-cream/70">{r.note}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-start gap-4 border-t border-cream/10 pt-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60">
            Try Lovable yourself
          </p>
          <a
            href={LOVABLE_AFFILIATE_HREF}
            target="_blank"
            rel="sponsored noopener"
            className="t-label inline-flex items-center gap-2 rounded-md border border-gold/50 bg-gold/5 px-4 py-2.5 text-gold transition-colors hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            Start building on Lovable
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
          <p className="t-body-sm text-cream/50">
            Not affiliated with Lovable AB or Codeium (Windsurf). Trademarks belong to their
            respective owners. Link to lovable.dev uses a referral code.
          </p>
        </section>
      </article>
    </main>
  );
}
