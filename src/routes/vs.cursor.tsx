import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Minus } from "lucide-react";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { LOVABLE_AFFILIATE_HREF } from "../lib/category-theme";

const PATH = "/vs/cursor";
const TITLE = "Lovable vs Cursor (2026): Honest Comparison — Lovable Feature Atlas";
const DESCRIPTION =
  "An independent, evenhanded comparison of Lovable and Cursor — who each is for, how you build with them, and why many teams end up using both.";
const UPDATED = "2026-07-10";

interface Faq {
  q: string;
  a: string;
}
const FAQS: Faq[] = [
  {
    q: "Is Lovable better than Cursor?",
    a: "Neither is strictly better — they solve different problems. Lovable is an AI full-stack app builder that ships a running app with a hosted backend, auth, storage, and a live preview from a prompt. Cursor is an AI-native code editor built on VS Code that helps a developer move faster inside an existing codebase. If you want an app that runs today, start with Lovable; if you're editing production code you already own, Cursor is the right seat.",
  },
  {
    q: "Can I use Lovable and Cursor together?",
    a: "Yes, and many teams do. Lovable's GitHub Sync writes every change to a real repository, so a developer can pull the repo into Cursor, extend the code by hand, and push back. Lovable picks the commits up on the next sync. Prototype and ship in Lovable, drop to Cursor for deep custom work.",
  },
  {
    q: "Does Lovable let me export or own the code?",
    a: "Yes. Lovable projects are standard React and TypeScript, and GitHub Sync gives you a full repository you own — you can clone it, run it locally, and keep it if you ever leave the platform. Cursor never owned the code to begin with because you bring your own repo.",
  },
  {
    q: "Which one is cheaper?",
    a: "It depends on how you use them. Both offer a free tier and paid plans; Cursor charges per developer seat, while Lovable meters AI usage and bundles hosting and backend into the plan. For a solo builder shipping one app, Lovable often replaces several paid services at once. For a team of engineers editing an existing codebase, Cursor seats are the cheaper unit of cost. Check each vendor's pricing page for current numbers.",
  },
];

interface Row {
  dimension: string;
  lovable: string;
  cursor: string;
}
const ROWS: Row[] = [
  {
    dimension: "Who it's for",
    lovable: "Founders, PMs, designers, and developers who want a running app from a prompt.",
    cursor: "Developers editing an existing codebase who want AI inside their editor.",
  },
  {
    dimension: "How you build",
    lovable: "Describe the app in chat; the agent generates, edits, and previews it live in the browser.",
    cursor: "Open a repo in a VS Code fork; use inline chat, tab completion, and an agent alongside your own edits.",
  },
  {
    dimension: "Backend and hosting",
    lovable: "Cloud backend (database, auth, storage, edge functions) and hosting included.",
    cursor: "None. You bring your own stack, database, and deploy pipeline.",
  },
  {
    dimension: "Code ownership and export",
    lovable: "Standard React and TypeScript; GitHub Sync gives you a real repository you own.",
    cursor: "The code was always yours — Cursor edits files in place in your repo.",
  },
  {
    dimension: "Agent capabilities",
    lovable: "Agent Mode plans and executes multi-step changes across the full stack, including database and functions.",
    cursor: "Agent runs multi-file edits and terminal commands inside the open workspace.",
  },
  {
    dimension: "Collaboration",
    lovable: "Multiplayer editing, share links, and roles inside the workspace.",
    cursor: "Standard git and pull-request flow via your host (GitHub, GitLab, etc.).",
  },
  {
    dimension: "Pricing model",
    lovable: "Tiered plans that meter AI usage; hosting and backend included.",
    cursor: "Per-developer seat, with usage limits on the higher-tier AI models.",
  },
  {
    dimension: "Learning curve",
    lovable: "Minutes. If you can describe the app in plain English, you can start.",
    cursor: "Familiar to anyone who has used VS Code; the AI features stack on top.",
  },
];

const CHOOSE_LOVABLE = [
  "You want to go from idea to running app — with a database and login — in an afternoon.",
  "You're a founder, PM, designer, or solo developer and don't want to stand up infrastructure.",
  "You want the AI to own the whole stack, not just the code your cursor is on.",
  "You value hosting, backend, and deployment being one bill instead of five.",
];

const CHOOSE_CURSOR = [
  "You already have a codebase and a team, and you want AI in the editor you already use.",
  "You're comfortable managing your own repo, CI, hosting, and infrastructure.",
  "Your work is deep engineering — refactors, performance, systems code — done by hand with AI help.",
  "You need the editor to fit inside an existing git-based workflow with reviews and branches.",
];

const RELATED: Array<{ slug: string; label: string; note: string }> = [
  { slug: "github-sync", label: "GitHub Sync", note: "Two-way sync to a real repo — the bridge that makes using both tools painless." },
  { slug: "code-mode", label: "Code Mode", note: "Edit the source directly inside Lovable when you want fine control." },
  { slug: "lovable-api", label: "Lovable API", note: "Programmatic access to build and edit Lovable projects from your own code." },
  { slug: "agent-mode", label: "Agent Mode", note: "Autonomous, end-to-end execution of multi-step changes across the stack." },
];

export const Route = createFileRoute("/vs/cursor")({
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
            headline: "Lovable vs Cursor: which one fits how you build?",
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
              { "@type": "SoftwareApplication", name: "Cursor" },
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
  component: VsCursorPage,
});

function VsCursorPage() {
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

        {/* Hero */}
        <header className="flex flex-col gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
            Comparisons · Updated July 2026
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl md:text-6xl">
            Lovable vs Cursor: which one fits how you build?
          </h1>
          <p className="t-body-lg max-w-3xl text-cream/85">
            Lovable is an AI full-stack app builder that ships a running app — with a cloud
            backend, hosting, and an agent — from a prompt. Cursor is an AI-native code editor
            built on VS Code for developers who want AI help inside their own codebase.
          </p>
          <p className="t-body-sm text-cream/55">
            Written from the atlas's independent-catalog voice. Not a hit piece; not a sales
            page. Every Lovable claim is grounded in a feature that exists in the catalog.
          </p>
        </header>

        {/* Different tools for different builders */}
        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Different tools for different builders
          </h2>
          <p className="t-body text-cream/85">
            The Lovable vs Cursor question is really two questions. The first is what you want
            to build — a running product, or a change to code you already have. The second is
            who is doing the building — someone who thinks in features and screens, or someone
            who thinks in files and functions. Get those right and the answer is usually
            obvious.
          </p>
          <p className="t-body text-cream/85">
            Lovable is built for people who want a working app to exist. You describe the
            thing; the agent scaffolds the UI, database, auth, and deploy, and you iterate in
            a live preview. Cursor is built for people who already have code and want AI to
            help them write more of it — tab completion, chat inside the editor, an agent
            that can run terminal commands and edit files across a repo.
          </p>
        </section>

        {/* Comparison table */}
        <section className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              At a glance
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/45">
              8 dimensions
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
                    Cursor
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
                      {row.cursor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Choose lists */}
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
              Choose Cursor if
            </h2>
            <ul className="flex flex-col gap-3">
              {CHOOSE_CURSOR.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] leading-relaxed text-cream/85">
                  <Minus className="mt-1 size-3.5 shrink-0 text-gold" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What many teams actually do */}
        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            What many teams actually do
          </h2>
          <p className="t-body-lg text-cream/90">
            The most common pattern isn't picking one — it's using both, in order.
          </p>
          <p className="t-body text-cream/85">
            Prototype and ship in Lovable. Let the agent scaffold the schema, the auth, the
            UI, and the deploy. When a piece of the app needs custom code the agent shouldn't
            own — a hairy algorithm, a delicate migration, a native integration — turn on
            GitHub Sync, pull the repo into Cursor, and write that piece by hand with AI help.
            Push back to the branch; Lovable picks the commit up on the next sync and keeps
            iterating on top.
          </p>
          <p className="t-body text-cream/85">
            The two tools are complements more than substitutes. Lovable removes the setup
            tax on starting; Cursor removes the friction of the hundredth code change. The
            bridge between them is a real git repository, which is what both tools produce.
          </p>
        </section>

        {/* Related atlas features */}
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

        {/* Outbound */}
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
            Not affiliated with Lovable AB or Anysphere (Cursor). Trademarks belong to their
            respective owners. Link to lovable.dev uses a referral code.
          </p>
        </section>
      </article>
    </main>
  );
}
