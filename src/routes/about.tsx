import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useFeatures } from "../hooks/use-features";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { LOVABLE_AFFILIATE_HREF } from "../lib/category-theme";
import { LovableHeart } from "../components/atlas/LovableHeart";
import { SubscribeForm } from "../components/atlas/SubscribeForm";

const LINKEDIN = "https://www.linkedin.com/in/alicia-dahling";

export const Route = createFileRoute("/about")({
  head: () => {
    const path = "/about";
    const canonical = buildCanonicalTags({ path });
    const title = "About, The Lovable Feature Atlas";
    const description =
      "An independent, fan-built catalog of every Lovable feature, updated daily from the official changelog. Curated by Alicia Dahling.";
    const image = `${SITE_ORIGIN}/og-image.png`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
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
            "@type": "AboutPage",
            url: canonicalUrl(path),
            mainEntity: {
              "@type": "Person",
              "@id": "https://atlas.dahlingdigital.com/#curator",
              name: "Alicia Dahling",
              url: LINKEDIN,
              sameAs: [LINKEDIN],
              jobTitle: "Accountant, Founder, and Advisor",
              worksFor: {
                "@type": "Organization",
                name: "Dahling Digital",
                url: "https://dahlingdigital.com",
              },
            },
          }),
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const { features } = useFeatures();
  const total = features.length;
  const ga = features.filter((f) => f.status === "GA").length;
  const categories = new Set(features.map((f) => f.category)).size;
  const lovableHref = LOVABLE_AFFILIATE_HREF;

  const stats: Array<{ label: string; value: string }> = [
    { label: "Features cataloged", value: String(total) },
    { label: "Categories", value: String(categories) },
    { label: "Generally available", value: String(ga) },
  ];

  return (
    <main className="relative w-full overflow-hidden">
      {/* Header band, fades into the body via mask */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(11,61,46,0.7) 0%, rgba(31,122,90,0.35) 45%, rgba(201,169,97,0.15) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
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
            About the atlas
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-cream sm:text-5xl md:text-6xl lg:text-[5rem]">
            An editorial catalog of everything Lovable ships.
          </h1>
        </header>

        {/* Oversized numeral row */}
        <section className="grid grid-cols-3 gap-6 border-y border-cream/10 py-10 sm:gap-10">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 flex-col gap-3">
              <div
                className="font-mono leading-[0.9] tracking-[-0.03em] text-cream"
                style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
              >
                {s.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50 sm:text-[11px]">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* Two-column story */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              What this is
            </h2>
            <p className="t-body-lg text-cream/90">
              An independent, fan-built catalog of every Lovable feature, beta, and release,
              updated daily from the official changelog and docs.
            </p>
            <p className="t-body text-cream/75">
              Built for serious builders evaluating Lovable, ambassadors keeping current, and
              teams making the case internally. Every entry links back to the primary source
              at docs.lovable.dev. Product names, logos, and copy belong to Lovable AB.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              How it stays current
            </h2>
            <p className="t-body text-cream/85">
              A nightly pipeline pulls the changelog, normalizes new entries against the
              existing taxonomy, and promotes Betas to GA once the docs confirm availability.
              Duplicates and thin rows are merged during weekly editorial passes so the atlas
              stays dense with signal.
            </p>
            <p className="t-body-sm text-cream/60">
              Spot an error, a missing feature, or a wrong release date? The best way to
              flag it is a note on LinkedIn, corrections usually ship within 24 hours.
            </p>
          </div>
        </section>

        {/* Curator */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              Curated by
            </h2>
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener"
              className="w-fit font-display text-3xl font-semibold text-cream hover:text-gold transition-colors sm:text-4xl"
            >
              Alicia Dahling
            </a>
            <p className="t-body text-cream/75">
              Alicia Dahling is an accountant and founder whose career runs from public
              accounting through an IPO to corporate finance at HP and Nortel. She invests
              in early-stage companies and funds STEM scholarships through the Anna Dahling
              Foundation. She builds on Lovable at Dahling Digital, where the atlas is made
              and kept current daily.
            </p>
            <p className="t-body text-cream/85">
              Partnerships and press:{" "}
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener"
                className="text-gold underline-offset-4 hover:underline"
              >
                message Alicia on LinkedIn
              </a>
              .
            </p>

          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-cream/10 bg-cream/[0.02] p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/60">
              Disclosure
            </h2>
            <p className="t-body-sm text-cream/70">
              The Lovable Feature Atlas is not affiliated with, endorsed by, sponsored by, or
              maintained by Lovable AB. It is a community reference. All trademarks belong to
              their respective owners.
            </p>
            <p className="t-body-sm text-cream/70">
              Links to lovable.dev use a referral code; the atlas is otherwise unsponsored.
            </p>
          </div>
        </section>

        {/* Comparisons */}
        <section className="flex flex-col gap-4 border-t border-cream/10 pt-10">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Comparisons
          </h2>
          <p className="t-body text-cream/75">
            Evenhanded, catalog-grounded takes on how Lovable compares to adjacent tools.
          </p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                to="/vs/cursor"
                className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-cream/80 hover:text-gold transition-colors"
              >
                Lovable vs Cursor
                <ArrowRight
                  className="size-3.5 text-cream/40 transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                  aria-hidden
                />
              </Link>
            </li>
          </ul>
        </section>


        {/* MCP */}
        <section
          id="mcp"
          className="flex scroll-mt-24 flex-col gap-6 border-t border-cream/10 pt-10"
        >
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
            Use the atlas from your AI
          </h2>
          <p className="t-body-lg text-cream/90">
            The atlas is also a live MCP server, any AI assistant that speaks the Model
            Context Protocol can query the catalog directly instead of guessing from a
            training cutoff.
          </p>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55">
              Endpoint
            </p>
            <code className="w-fit max-w-full overflow-x-auto rounded-md border border-cream/10 bg-cream/[0.03] px-3 py-2 font-mono text-[13px] text-cream">
              https://atlas.dahlingdigital.com/mcp
            </code>
            <p className="t-body-sm text-cream/60">
              Public, read-only. No API key or authentication required.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55">
              Tools
            </p>
            <ul className="grid gap-2 text-cream/85 sm:grid-cols-2">
              <li className="rounded-md border border-cream/10 bg-cream/[0.02] p-3">
                <code className="font-mono text-[12px] text-gold">search_features</code>
                <p className="t-body-sm mt-1 text-cream/70">
                  Keyword, category, and status search across the catalog.
                </p>
              </li>
              <li className="rounded-md border border-cream/10 bg-cream/[0.02] p-3">
                <code className="font-mono text-[12px] text-gold">get_feature</code>
                <p className="t-body-sm mt-1 text-cream/70">
                  Full detail for a single feature by id, with canonical URL.
                </p>
              </li>
              <li className="rounded-md border border-cream/10 bg-cream/[0.02] p-3">
                <code className="font-mono text-[12px] text-gold">list_recent_launches</code>
                <p className="t-body-sm mt-1 text-cream/70">
                  Most recent releases, newest first.
                </p>
              </li>
              <li className="rounded-md border border-cream/10 bg-cream/[0.02] p-3">
                <code className="font-mono text-[12px] text-gold">catalog_stats</code>
                <p className="t-body-sm mt-1 text-cream/70">
                  Totals by status, category, and pricing tier.
                </p>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55">
              Connect
            </p>

            <div className="flex flex-col gap-2">
              <p className="t-body-sm text-cream/70">Claude Code</p>
              <pre className="overflow-x-auto rounded-md border border-cream/10 bg-cream/[0.03] p-3 font-mono text-[12px] leading-relaxed text-cream">
{`claude mcp add atlas --transport http https://atlas.dahlingdigital.com/mcp`}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <p className="t-body-sm text-cream/70">Claude Desktop / claude.ai</p>
              <p className="t-body-sm text-cream/60">
                Settings → Connectors → Add custom connector, then paste the endpoint URL:
              </p>
              <pre className="overflow-x-auto rounded-md border border-cream/10 bg-cream/[0.03] p-3 font-mono text-[12px] leading-relaxed text-cream">
{`https://atlas.dahlingdigital.com/mcp`}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <p className="t-body-sm text-cream/70">Generic MCP client</p>
              <pre className="overflow-x-auto rounded-md border border-cream/10 bg-cream/[0.03] p-3 font-mono text-[12px] leading-relaxed text-cream">
{`{ "url": "https://atlas.dahlingdigital.com/mcp" }`}
              </pre>
            </div>
          </div>
        </section>

        {/* Weekly digest signup */}
        <section className="rounded-lg border border-gold/25 bg-gradient-to-b from-gold/[0.04] to-transparent p-8 md:p-10">
          <SubscribeForm variant="expanded" source="about" />
        </section>



        {/* Outbound */}
        <section className="flex flex-col items-start gap-4 border-t border-cream/10 pt-10">
          <div className="flex items-center gap-3">
            <LovableHeart className="size-6" aria-hidden />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60">
              Try it yourself
            </span>
          </div>
          <a
            href={lovableHref}
            target="_blank"
            rel="sponsored noopener"
            className="t-label inline-flex items-center gap-2 rounded-md border border-gold/50 bg-gold/5 px-4 py-2.5 text-gold transition-colors hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            Start building on Lovable
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </section>
      </div>
    </main>
  );
}
