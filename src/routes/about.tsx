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
            author: {
              "@type": "Person",
              name: "Alicia Dahling",
              sameAs: [LINKEDIN],
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
    <main className="w-full">
      {/* Header band */}
      <div className="relative w-full overflow-hidden border-b border-cream/8">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(11,61,46,0.65) 0%, rgba(31,122,90,0.35) 45%, rgba(201,169,97,0.15) 100%)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <Link
            to="/"
            className="t-label inline-flex w-fit items-center gap-2 text-cream/60 transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to the atlas
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">About the atlas</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-5xl md:text-6xl">
            An editorial catalog of everything Lovable ships.
          </h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-5 py-14 sm:px-8 sm:py-20">
        {/* What it is */}
        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">What this is</h2>
          <p className="t-body-lg text-cream/90">
            An independent, fan-built catalog of every Lovable feature, beta, and release —
            updated daily from the official changelog and docs.
          </p>
          <p className="t-body text-cream/75">
            Built for serious builders evaluating Lovable, ambassadors keeping current, and
            teams making the case internally. Every entry links back to the primary source at
            docs.lovable.dev. Product names, logos, and copy belong to Lovable AB.
          </p>
        </section>

        {/* Live stats */}
        <section className="grid grid-cols-3 gap-4 border-y border-cream/10 py-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <div className="font-mono text-3xl text-cream sm:text-4xl">{s.value}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/50">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* Curator */}
        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">Curated by</h2>
          <div className="flex flex-col gap-3">
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener"
              className="w-fit font-display text-2xl font-semibold text-cream hover:text-gold transition-colors"
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
        </section>

        {/* Disclosure */}
        <section className="flex flex-col gap-3 rounded-lg border border-cream/10 bg-cream/[0.02] p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/60">Disclosure</h2>
          <p className="t-body-sm text-cream/70">
            The Lovable Feature Atlas is not affiliated with, endorsed by, sponsored by, or
            maintained by Lovable AB. It is a community reference. All trademarks belong to
            their respective owners.
          </p>
        </section>

        {/* Contact */}
        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald">Partnership &amp; sponsorship</h2>
          <p className="t-body text-cream/80">
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
