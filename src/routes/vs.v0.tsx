import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Minus } from "lucide-react";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { LOVABLE_AFFILIATE_HREF } from "../lib/category-theme";

const PATH = "/vs/v0";
const TITLE = "Lovable vs v0.dev (2026): Honest Comparison, Lovable Feature Atlas";
const DESCRIPTION =
  "An independent, evenhanded comparison of Lovable and v0.dev, who each is for, what they generate, and why full-stack builders and UI-only prototypers pick different tools.";
const UPDATED = "2026-07-16";

interface Faq {
  q: string;
  a: string;
}
const FAQS: Faq[] = [
  {
    q: "Is Lovable better than v0.dev?",
    a: "They solve different problems. Lovable is a full-stack AI app builder that ships a running application with a database, auth, storage, edge functions, and hosting from a single prompt. v0.dev is a UI generator from Vercel that turns prompts and screenshots into React and Tailwind components you paste into your own Next.js app. Lovable delivers a working product; v0 delivers polished front-end code.",
  },
  {
    q: "Can I use Lovable and v0.dev together?",
    a: "Yes. A common pattern is to generate a specific component or a marketing-page section in v0, then drop the JSX into a Lovable project via Code Mode or GitHub Sync. Lovable owns the full stack, and v0 acts as a component sketchpad for the pieces you want to hand-tune.",
  },
  {
    q: "Does v0.dev give me a backend?",
    a: "No. v0 generates React components and, more recently, small Next.js snippets, but it does not stand up a database, authentication, storage, or deploy target on its own. You wire it into your own stack, usually Next.js on Vercel with a separately configured backend. Lovable includes all of that in the box.",
  },
  {
    q: "Which one is cheaper?",
    a: "It depends on scope. v0 charges per generation and per plan on top of your existing Vercel and backend bills. Lovable meters AI usage but bundles hosting, database, auth, and edge functions into one plan. For a solo builder shipping one full app, Lovable often replaces several paid services at once. For a team that only needs component drafts, v0 can be the cheaper add-on. Check each vendor's current pricing page.",
  },
];

interface Row {
  dimension: string;
  lovable: string;
  v0: string;
}
const ROWS: Row[] = [
  {
    dimension: "Who it's for",
    lovable: "Founders, PMs, designers, and developers who want a running full-stack app from a prompt.",
    v0: "Developers and designers who want AI-generated React and Tailwind components for an existing project.",
  },
  {
    dimension: "What gets built",
    lovable: "A live application with UI, database, auth, functions, and hosting, all wired together.",
    v0: "Individual React components or Next.js snippets you copy into your own codebase.",
  },
  {
    dimension: "Backend and hosting",
    lovable: "Cloud backend (database, auth, storage, edge functions) and hosting included.",
    v0: "None. Bring your own Next.js app, database, and Vercel or other host.",
  },
  {
    dimension: "How you build",
    lovable: "Describe the app in chat; the agent scaffolds, edits, and previews it live in the browser.",
    v0: "Prompt (or upload a screenshot) for a component; iterate in a chat panel; copy the code out.",
  },
  {
    dimension: "Code ownership and export",
    lovable: "Standard React and TypeScript; GitHub Sync gives you a real repository you own.",
    v0: "Snippet output you paste into your own repo; ownership sits with your project.",
  },
  {
    dimension: "Agent capabilities",
    lovable: "Agent Mode plans and executes multi-step changes across the full stack, including DB and functions.",
    v0: "Focused on generating and iterating on UI blocks; not an autonomous multi-file, full-stack agent.",
  },
  {
    dimension: "Design fidelity",
    lovable: "Editable via design tokens and shadcn/ui; matches shipping-app conventions end to end.",
    v0: "High-fidelity, screenshot-to-component workflow tuned for polished Tailwind UI.",
  },
  {
    dimension: "Pricing model",
    lovable: "Tiered plans that meter AI usage; hosting and backend included.",
    v0: "Free tier plus per-generation/paid plans, on top of your own hosting and backend costs.",
  },
];

const CHOOSE_LOVABLE = [
  "You want a working, deployed app with a database and login, not just React components.",
  "You're a founder, PM, designer, or solo developer and don't want to stand up your own backend.",
  "You want the AI to own the whole stack: schema, auth, UI, functions, and deploy.",
  "You value hosting, backend, and deployment being one bill instead of five.",
];

const CHOOSE_V0 = [
  "You already have a Next.js app and only need beautifully generated UI blocks.",
  "You want screenshot-to-component prototyping for a specific page or feature.",
  "You're on the Vercel stack and prefer keeping backend choices in your own hands.",
  "You need a fast sketchpad for marketing-page sections, forms, or dashboards.",
];

const RELATED: Array<{ slug: string; label: string; note: string }> = [
  { slug: "github-sync", label: "GitHub Sync", note: "Two-way sync to a real repo, so v0-generated components can drop straight into a Lovable project." },
  { slug: "code-mode", label: "Code Mode", note: "Edit the source directly inside Lovable when you want to hand-tune JSX from v0." },
  { slug: "agent-mode", label: "Agent Mode", note: "Autonomous, end-to-end execution of multi-step changes across the stack." },
  { slug: "lovable-cloud", label: "Lovable Cloud", note: "The included database, auth, storage, and functions that v0 doesn't ship with." },
];

export const Route = createFileRoute("/vs/v0")({
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
            headline: "Lovable vs v0.dev: which one fits how you build?",
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
              { "@type": "SoftwareApplication", name: "v0.dev" },
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
  component: VsV0Page,
});

function VsV0Page() {
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
            Lovable vs v0.dev: which one fits how you build?
          </h1>
          <p className="t-body-lg max-w-3xl text-cream/85">
            Lovable is an AI full-stack app builder that ships a running app, with a cloud
            backend, hosting, and an agent, from a prompt. v0.dev is Vercel's AI UI
            generator that turns prompts and screenshots into React and Tailwind
            components you paste into your own Next.js app.
          </p>
          <p className="t-body-sm text-cream/55">
            Written from the atlas's independent-catalog voice. Not a hit piece; not a
            sales page. Every Lovable claim is grounded in a feature that exists in the
            catalog.
          </p>
        </header>

        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Different tools for different outputs
          </h2>
          <p className="t-body text-cream/85">
            The Lovable vs v0 question comes down to what you actually need to leave
            with. If you need a running product with a database, users, and a URL you
            can share, Lovable is built for that. If you need a beautiful component to
            paste into an app you already own, v0 is built for that.
          </p>
          <p className="t-body text-cream/85">
            Lovable's agent scaffolds a full stack, UI, schema, auth, functions, and a
            deploy, and iterates on it in a live preview. v0 focuses on the UI layer,
            it excels at screenshot-to-component workflows and polished Tailwind
            output, and it hands you code to drop into your own repo.
          </p>
        </section>

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
                    v0.dev
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
                      {row.v0}
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
              Choose v0.dev if
            </h2>
            <ul className="flex flex-col gap-3">
              {CHOOSE_V0.map((item) => (
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
            The most common pattern isn't picking one, it's using each for what it's
            best at.
          </p>
          <p className="t-body text-cream/85">
            Ship the app in Lovable. Let the agent scaffold the schema, auth, UI, and
            deploy. When a specific screen or hero section needs a hand-crafted look,
            prompt v0 for that block, iterate on it in v0's canvas, and paste the JSX
            into your Lovable project via Code Mode or a GitHub Sync branch. Lovable
            owns the wiring; v0 owns the component sketch.
          </p>
          <p className="t-body text-cream/85">
            The two tools are complements more than substitutes for teams that want
            both a running product and a curated component library. If you only need
            one of those two things, the choice is straightforward.
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
            Not affiliated with Lovable AB or Vercel (v0.dev). Trademarks belong to
            their respective owners. Link to lovable.dev uses a referral code.
          </p>
        </section>
      </article>
    </main>
  );
}
