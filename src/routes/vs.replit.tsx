import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Minus } from "lucide-react";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { LOVABLE_AFFILIATE_HREF } from "../lib/category-theme";

const PATH = "/vs/replit";
const TITLE = "Lovable vs Replit (2026): Honest Comparison, Lovable Feature Atlas";
const DESCRIPTION =
  "An independent, evenhanded comparison of Lovable and Replit Agent. Who each is for, how you build, agent autonomy, backend hosting, and where each tool actually shines.";
const UPDATED = "2026-07-19";

interface Faq {
  q: string;
  a: string;
}
const FAQS: Faq[] = [
  {
    q: "Is Lovable better than Replit?",
    a: "They optimize for different phases. Replit is a browser-based IDE with a workspace, terminal, package manager, and language runtimes; its Agent iterates on files inside that workspace. Lovable is an AI full-stack builder that spins up a running app with a real database, auth, hosting, and an autonomous multi-step agent from a prompt. If you want an IDE you can code in yourself with agent assistance, Replit is stronger. If you want an autonomous agent to ship and evolve a whole app end to end, Lovable is stronger.",
  },
  {
    q: "Can I export my code from Lovable and Replit?",
    a: "Yes on both. Replit projects can be exported or pushed to GitHub from the workspace. Lovable's GitHub Sync writes every change to a real repository you own; the code is standard React and TypeScript, you can clone it and run it locally at any time.",
  },
  {
    q: "Which one has a real backend and hosting?",
    a: "Both do, with different shapes. Replit has Replit Deployments plus its own database offering, tied to the workspace. Lovable Cloud bundles Postgres, auth, storage, and edge functions into the plan and hosts the app on a stable URL you can point a custom domain at. Lovable's bundle is opinionated and closer to production defaults out of the box; Replit's is more open-ended and closer to a general-purpose cloud IDE.",
  },
  {
    q: "Which one has a more autonomous agent?",
    a: "Lovable's Agent Mode is designed to plan and execute multi-step changes across the full stack, including schema migrations and edge functions, without asking for permission at every step. Replit Agent is fast at generating and iterating inside the workspace, but stays closer to the current file context than an end-to-end execution loop.",
  },
];

interface Row {
  dimension: string;
  lovable: string;
  replit: string;
}
const ROWS: Row[] = [
  {
    dimension: "Who it's for",
    lovable: "Founders, PMs, designers, and developers who want to ship and keep running a real product.",
    replit: "Developers and learners who want a browser IDE with an agent that can write code alongside them.",
  },
  {
    dimension: "How you build",
    lovable: "Chat with an agent that scaffolds UI, database, auth, and deploy, iterating in a live preview.",
    replit: "Prompt Replit Agent inside a full IDE with a terminal, package manager, and language runtimes.",
  },
  {
    dimension: "Backend and hosting",
    lovable: "Lovable Cloud (Postgres, auth, storage, edge functions) and hosting are included in the plan.",
    replit: "Replit Deployments plus a bundled database; more open-ended, less opinionated defaults.",
  },
  {
    dimension: "Agent autonomy",
    lovable: "Agent Mode plans and executes multi-step changes across the stack, including schema and functions.",
    replit: "Replit Agent iterates quickly inside the workspace; leans on the developer to steer next steps.",
  },
  {
    dimension: "Code ownership and export",
    lovable: "Standard React and TypeScript; GitHub Sync gives you a real, two-way-synced repository.",
    replit: "Export the workspace or push to GitHub; you own the code and can run it outside Replit.",
  },
  {
    dimension: "Collaboration",
    lovable: "Multiplayer editing, share links, and workspace roles.",
    replit: "Multiplayer coding is a first-class Replit feature; live cursors and shared terminals.",
  },
  {
    dimension: "Pricing model",
    lovable: "Tiered plans that meter AI usage; hosting and backend included.",
    replit: "Tiered plans that meter compute, storage, and agent usage; deployments billed separately.",
  },
  {
    dimension: "Best at",
    lovable: "Turning an idea into a running, hosted app with a real database and auth.",
    replit: "Coding in a browser IDE with an AI teammate, in any language you want.",
  },
];

const CHOOSE_LOVABLE = [
  "You want a running, hosted app with a real database and auth on day one.",
  "You want an agent that can plan and execute multi-step changes across the stack.",
  "You want hosting, backend, and deployment on one bill instead of five.",
  "You prefer chatting with an agent over living inside an IDE.",
];

const CHOOSE_REPLIT = [
  "You want a full browser IDE with a terminal and any language runtime.",
  "You like writing code yourself with an agent as a fast pair.",
  "You want a general-purpose sandbox that isn't opinionated about your stack.",
  "You collaborate live in the editor with teammates or students.",
];

const RELATED: Array<{ slug: string; label: string; note: string }> = [
  { slug: "lovable-cloud", label: "Lovable Cloud", note: "Bundled Postgres, auth, storage, and edge functions." },
  { slug: "agent-mode", label: "Agent Mode", note: "Autonomous, end-to-end execution of multi-step changes across the stack." },
  { slug: "github-sync", label: "GitHub Sync", note: "Two-way sync to a real repository you own." },
  { slug: "lovable-api", label: "Lovable API", note: "Programmatic access to build and edit Lovable projects from your own code." },
];

export const Route = createFileRoute("/vs/replit")({
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
            headline: "Lovable vs Replit: which one fits how you build?",
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
              { "@type": "SoftwareApplication", name: "Replit" },
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
  component: VsReplitPage,
});

function VsReplitPage() {
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
            Lovable vs Replit: which one fits how you build?
          </h1>
          <p className="t-body-lg max-w-3xl text-cream/85">
            Replit is a browser-based IDE with an AI Agent that writes and edits code inside a
            full workspace. Lovable is an AI full-stack app builder that ships a running app
            with a real database, auth, hosting, and an autonomous agent, from a prompt.
          </p>
          <p className="t-body-sm text-cream/55">
            Written from the atlas's independent-catalog voice. Not a hit piece; not a sales
            page. Every Lovable claim is grounded in a feature that exists in the catalog.
          </p>
        </header>

        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Same category, different center of gravity
          </h2>
          <p className="t-body text-cream/85">
            Both tools accept a prompt and hand back a running app. The difference is where
            the center of gravity sits. Replit centers the IDE, the terminal, and the
            language runtime; the Agent is a helpful pair working inside that surface.
            Lovable centers the agent and the running product; the code, backend, and
            hosting arrange themselves around what the agent is trying to ship.
          </p>
          <p className="t-body text-cream/85">
            The gap shows up on day two. Replit stays flexible for anything you'd open a
            terminal for. Lovable stays opinionated for shipping a hosted app with a real
            database, auth, and an evolving agent behind it.
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
                    Replit
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
                      {row.replit}
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
              Choose Replit if
            </h2>
            <ul className="flex flex-col gap-3">
              {CHOOSE_REPLIT.map((item) => (
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
            Prototype in Replit, ship product in Lovable.
          </p>
          <p className="t-body text-cream/85">
            Replit is a great home for the scrappy scripts, side experiments, and language
            playgrounds that don't need to become products. When one of those experiments
            grows into an app with users, a domain, and a real database, Lovable is the
            surface that carries it to production without stitching together a backend by
            hand. Because Lovable projects are standard React and TypeScript with GitHub
            Sync, you keep ownership either way.
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
            Not affiliated with Lovable AB or Replit, Inc. Trademarks belong to their
            respective owners. Link to lovable.dev uses a referral code.
          </p>
        </section>
      </article>
    </main>
  );
}
