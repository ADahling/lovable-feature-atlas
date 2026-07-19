import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Minus } from "lucide-react";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { LOVABLE_AFFILIATE_HREF } from "../lib/category-theme";

const PATH = "/vs/bolt";
const TITLE = "Lovable vs Bolt.new (2026): Honest Comparison, Lovable Feature Atlas";
const DESCRIPTION =
  "An independent, evenhanded comparison of Lovable and Bolt.new, who each is for, how you build, agent autonomy, backend hosting, and where each tool actually shines.";
const UPDATED = "2026-07-19";

interface Faq {
  q: string;
  a: string;
}
const FAQS: Faq[] = [
  {
    q: "Is Lovable better than Bolt.new?",
    a: "They target the same builder but optimize for different phases. Bolt.new is fastest at spinning up a StackBlitz-powered sandbox for a runnable prototype in the browser. Lovable is stronger once you need a real backend, persistent database, auth, cloud hosting, an autonomous multi-step agent, and a real GitHub repository. If you're demoing an idea for an hour, Bolt is frictionless. If you're shipping a product you plan to keep, Lovable carries you further.",
  },
  {
    q: "Can I export my code from Lovable and Bolt.new?",
    a: "Yes on both, with different flavors. Bolt gives you a StackBlitz project you can download or push to GitHub. Lovable's GitHub Sync writes every change to a real repository you own; the code is standard React and TypeScript, you can clone it and run it locally at any time.",
  },
  {
    q: "Which one has a real backend and hosting?",
    a: "Lovable does, out of the box. Lovable Cloud bundles a Postgres database, auth, storage, and edge functions with the plan, and the app is hosted on a stable URL you can point a custom domain at. Bolt runs the app in a WebContainer sandbox in the browser; you bring your own backend and hosting when you're ready to ship.",
  },
  {
    q: "Which one has a more autonomous agent?",
    a: "Lovable's Agent Mode is designed to plan and execute multi-step changes across the full stack, including schema migrations and edge functions, without asking for permission at every step. Bolt's agent is fast at generating and iterating on a single project, but stays closer to the current file context than an autonomous execution loop.",
  },
];

interface Row {
  dimension: string;
  lovable: string;
  bolt: string;
}
const ROWS: Row[] = [
  {
    dimension: "Who it's for",
    lovable: "Founders, PMs, designers, and developers who want to ship and keep running a real product.",
    bolt: "Anyone who wants to spin up a runnable prototype in the browser in seconds.",
  },
  {
    dimension: "How you build",
    lovable: "Chat with an agent that scaffolds UI, database, auth, and deploy, iterating in a live preview.",
    bolt: "Prompt into a StackBlitz WebContainer; edit files and see the app run in the same tab.",
  },
  {
    dimension: "Backend and hosting",
    lovable: "Lovable Cloud (Postgres, auth, storage, edge functions) and hosting are included in the plan.",
    bolt: "None built in. You bring your own database and deploy target once the prototype grows up.",
  },
  {
    dimension: "Agent autonomy",
    lovable: "Agent Mode plans and executes multi-step changes across the stack, including schema and functions.",
    bolt: "Agent iterates on the open project quickly; less autonomous, more prompt-by-prompt.",
  },
  {
    dimension: "Code ownership and export",
    lovable: "Standard React and TypeScript; GitHub Sync gives you a real, two-way-synced repository.",
    bolt: "Download the StackBlitz project or push to GitHub; you own the code either way.",
  },
  {
    dimension: "Collaboration",
    lovable: "Multiplayer editing, share links, and workspace roles.",
    bolt: "Share a StackBlitz URL; deeper collaboration happens in your git host.",
  },
  {
    dimension: "Pricing model",
    lovable: "Tiered plans that meter AI usage; hosting and backend included.",
    bolt: "Tiered plans metered by tokens/messages; hosting and backend are separate concerns.",
  },
  {
    dimension: "Best at",
    lovable: "Turning an idea into a running, hosted app with a real database and auth.",
    bolt: "Turning an idea into a runnable browser sandbox in seconds.",
  },
];

const CHOOSE_LOVABLE = [
  "You want a running, hosted app with a real database and auth on day one.",
  "You want an agent that can plan and execute multi-step changes across the stack.",
  "You want hosting, backend, and deployment on one bill instead of five.",
  "You plan to keep and grow the codebase after the first weekend.",
];

const CHOOSE_BOLT = [
  "You want the fastest possible path from prompt to runnable sandbox in the browser.",
  "You're building a throwaway prototype or a demo for a meeting later today.",
  "You already know where you'll host the app and don't want a bundled backend.",
  "You prefer editing files directly in a WebContainer over an agent-driven flow.",
];

const RELATED: Array<{ slug: string; label: string; note: string }> = [
  { slug: "lovable-cloud", label: "Lovable Cloud", note: "Bundled Postgres, auth, storage, and edge functions, the thing Bolt does not include." },
  { slug: "agent-mode", label: "Agent Mode", note: "Autonomous, end-to-end execution of multi-step changes across the stack." },
  { slug: "github-sync", label: "GitHub Sync", note: "Two-way sync to a real repository you own." },
  { slug: "lovable-api", label: "Lovable API", note: "Programmatic access to build and edit Lovable projects from your own code." },
];

export const Route = createFileRoute("/vs/bolt")({
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
            headline: "Lovable vs Bolt.new: which one fits how you build?",
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
              { "@type": "SoftwareApplication", name: "Bolt.new" },
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
  component: VsBoltPage,
});

function VsBoltPage() {
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
            Lovable vs Bolt.new: which one fits how you build?
          </h1>
          <p className="t-body-lg max-w-3xl text-cream/85">
            Bolt.new is a browser-based prompt-to-prototype sandbox built on StackBlitz
            WebContainers. Lovable is an AI full-stack app builder that ships a running app
            with a real database, auth, hosting, and an autonomous agent, from a prompt.
          </p>
          <p className="t-body-sm text-cream/55">
            Written from the atlas's independent-catalog voice. Not a hit piece; not a sales
            page. Every Lovable claim is grounded in a feature that exists in the catalog.
          </p>
        </header>

        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Same starting point, different finish line
          </h2>
          <p className="t-body text-cream/85">
            Both tools accept a prompt and hand back a running app. The interesting question
            is what happens on day two. Bolt is optimized for the very first minute, the
            demo, the sketch, the throwaway. Lovable is optimized for the app that survives
            the demo, the one you keep editing next month, hand a customer, put on a domain,
            and stand up a real database behind.
          </p>
          <p className="t-body text-cream/85">
            The gap shows up in what's bundled. Lovable includes Cloud (Postgres, auth,
            storage, edge functions) and hosting; Bolt runs the app inside a browser
            WebContainer and leaves the backend and deploy target to you.
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
                    Bolt.new
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
                      {row.bolt}
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
              Choose Bolt.new if
            </h2>
            <ul className="flex flex-col gap-3">
              {CHOOSE_BOLT.map((item) => (
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
            Sketch in Bolt, ship in Lovable.
          </p>
          <p className="t-body text-cream/85">
            Bolt is a fantastic scratchpad; you can validate an idea in the time it takes to
            write the prompt. When the sketch survives contact with a real user and needs a
            database, auth, a stable URL, and an agent that can keep evolving the whole
            stack, move it into Lovable. Because Lovable projects are standard React and
            TypeScript with GitHub Sync, you keep ownership either way.
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
            Not affiliated with Lovable AB or StackBlitz (Bolt.new). Trademarks belong to
            their respective owners. Link to lovable.dev uses a referral code.
          </p>
        </section>
      </article>
    </main>
  );
}
