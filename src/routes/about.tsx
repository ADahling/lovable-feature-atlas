import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Linkedin } from "lucide-react";
import { useFeatures } from "../hooks/use-features";
import { buildCanonicalTags, canonicalUrl, SITE_ORIGIN } from "../lib/canonical-meta";
import { LOVABLE_UTM } from "../lib/category-theme";
import { LovableHeart } from "../components/atlas/LovableHeart";

const LINKEDIN = "https://www.linkedin.com/in/alicia-dahling";

export const Route = createFileRoute("/about")({
  head: () => {
    const path = "/about";
    const canonical = buildCanonicalTags({ path });
    const title = "About — The Lovable Feature Atlas";
    const description =
      "The independent, fan-built catalog of every Lovable feature, updated daily from the official changelog. Curated by Alicia Dahling — Accountant, founder of Dahling Digital, and Lovable community advocate.";
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
              "@id": "https://lovable-feature-atlas.lovable.app/#curator",
              name: "Alicia Dahling",
              url: LINKEDIN,
              sameAs: [LINKEDIN],
              jobTitle: "CFO | Finance Leader | Angel Investor | STEM Advocate",
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
  const lovableHref = `https://lovable.dev?${LOVABLE_UTM}`;

  const stats: Array<{ label: string; value: string }> = [
    { label: "Features cataloged", value: String(total) },
    { label: "Categories", value: String(categories) },
    { label: "Generally available", value: String(ga) },
  ];

  return (
    <main className="relative w-full overflow-hidden">
      {/* Header band — fades into the body via mask */}
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
              An independent, fan-built catalog of every Lovable feature, beta, and release —
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
              flag it is a note on LinkedIn — corrections usually ship within 24 hours.
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
              CFO, finance leader, angel investor, and STEM advocate. Founder of Dahling
              Digital, where the atlas is built and maintained.
            </p>
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener"
              className="t-label inline-flex w-fit items-center gap-2 rounded-md border border-cream/20 px-3 py-2 text-cream/85 transition-colors hover:border-gold hover:text-gold"
            >
              <Linkedin className="size-3.5" aria-hidden />
              Connect on LinkedIn
            </a>
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
            <h2 className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">
              Partnership &amp; sponsorship
            </h2>
            <p className="t-body-sm text-cream/80">
              For partnership, sponsorship, or editorial inquiries, reach Alicia directly on{" "}
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener"
                className="text-gold underline-offset-4 hover:underline"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>
        </section>

        {/* Outbound */}
        <section className="flex flex-col items-start gap-4 border-t border-cream/10 pt-10">
          <div className="flex items-center gap-3">
            <LovableHeart className="size-6" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/60">
              Try it yourself
            </span>
          </div>
          <a
            href={lovableHref}
            target="_blank"
            rel="noopener"
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
