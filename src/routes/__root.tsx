import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { MotionConfig } from "framer-motion";

import appCss from "../styles.css?url";
import { Oracle } from "../components/atlas/Oracle";
import { Footer } from "../components/atlas/Footer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Toaster } from "../components/ui/sonner";
import { openPalette } from "../lib/palette";

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
          Missing reel
        </p>
        <h1 className="mt-3 font-display text-7xl font-semibold tracking-tight text-cream">
          404
        </h1>
        <h2 className="mt-4 font-display text-xl font-medium text-cream">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-cream/70">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-foil inline-flex items-center rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">
          Projection interrupted
        </p>
        <h1 className="mt-3 font-display text-xl font-semibold tracking-tight text-cream">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-cream/70">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-foil inline-flex items-center rounded-md px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-cream transition-colors hover:bg-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "F-ok54a0ZpD_GxS2EzRGVLtizwV1MJs_hqyWBSpUp7M" },
      { name: "google-site-verification", content: "ex6d0kx8bNNJGPWFvtEA0CjktyTdphq2SVVqPi8yiws" },
      { name: "author", content: "Alicia Dahling" },
      { property: "og:site_name", content: "The Lovable Feature Atlas" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "The Lovable Feature Atlas" },
      { property: "og:title", content: "The Lovable Feature Atlas" },
      { name: "twitter:title", content: "The Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "An independent, fan-built catalog of every Lovable feature, beta, and release, updated daily from the official changelog and docs.",
      },
      {
        property: "og:description",
        content:
          "An independent, fan-built catalog of every Lovable feature, beta, and release, updated daily from the official changelog and docs.",
      },
      {
        name: "twitter:description",
        content:
          "An independent, fan-built catalog of every Lovable feature, beta, and release, updated daily from the official changelog and docs.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/dc152fe7-e6db-43a9-9172-c1468fa64741",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/dc152fe7-e6db-43a9-9172-c1468fa64741",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      { rel: "icon", type: "image/svg+xml", sizes: "32x32", href: "/favicon.svg" },
      { rel: "icon", type: "image/svg+xml", sizes: "16x16", href: "/favicon.svg" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,400,0,0;0,9..144,500,0,0;0,9..144,600,0,0;1,9..144,500,0,0&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,400,0,0;0,9..144,500,0,0;0,9..144,600,0,0;1,9..144,500,0,0&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": "https://atlas.dahlingdigital.com/#curator",
              name: "Alicia Dahling",
              url: "https://www.linkedin.com/in/alicia-dahling",
              sameAs: ["https://www.linkedin.com/in/alicia-dahling"],
              jobTitle: "Accountant, Founder, and Advisor",
              worksFor: {
                "@type": "Organization",
                name: "Dahling Digital",
                url: "https://dahlingdigital.com",
              },
            },
            {
              "@type": "Organization",
              name: "Dahling Digital",
              url: "https://dahlingdigital.com",
              founder: { "@id": "https://atlas.dahlingdigital.com/#curator" },
            },
            {
              "@type": "WebSite",
              name: "Lovable Feature Atlas",
              url: "https://atlas.dahlingdigital.com",
              description: "An editorial catalog of every Lovable feature, beta, and release.",
              author: { "@id": "https://atlas.dahlingdigital.com/#curator" },
              creator: { "@id": "https://atlas.dahlingdigital.com/#curator" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Plausible — account-issued per-site script + queue stub. Lives here
            (not in head() scripts) because only root-JSX scripts are reliably
            SSR-rendered; head() script entries with src get dropped. */}
        <script async src="https://plausible.io/js/pa-PyWMwiodZwqTpfP8ZRJAy.js" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()",
          }}
        />
        <HeadContent />
      </head>
      <body className="bg-ink text-cream font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // The constellation is a self-contained full-viewport instrument with its
  // own header, back link, and controls — the global film chrome stands
  // down there so the map keeps its full 100dvh exploration area.
  const pathname = useLocation({ select: (location) => location.pathname });
  const immersive = pathname === "/constellation";

  return (
    <QueryClientProvider client={queryClient}>
      {/* Site-wide reduced-motion collapse for every framer-motion animation:
          transform animations disable under prefers-reduced-motion while
          opacity fades remain (the DESIGN.md motion contract). */}
      <MotionConfig reducedMotion="user">
        {!immersive && <FilmProgress />}
        {!immersive && <FilmHeader />}
        <Outlet />
        <Footer />
        <Oracle />
        <Toaster />
      </MotionConfig>
    </QueryClientProvider>
  );
}

/** 2px molten-gold scroll-progress bar — the film-timeline metaphor. */
function FilmProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={barRef} aria-hidden className="film-progress" />;
}

const NAV_LINK_CLASS =
  "hidden sm:inline-flex items-center rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/70 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70";

/** Thin ivory film-header bar: emblem + wordmark left, mono nav right. */
function FilmHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/[0.94] backdrop-blur-md">
      <div className="mx-auto flex h-12 w-full max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          aria-label="The Lovable Feature Atlas — home"
        >
          <img
            src="/art/atlas-emblem-96.webp"
            alt=""
            width={26}
            height={26}
            className="size-[26px] shrink-0 rounded-full"
            loading="eager"
            decoding="async"
          />
          <span className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cream">
            The Lovable Feature Atlas
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-0.5 sm:gap-1.5">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search the catalog"
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/80 transition-colors hover:border-gold-deep hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <Search className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <kbd
              aria-hidden
              className="hidden rounded border border-line px-1 py-px font-mono text-[9px] text-cream/55 lg:inline-block"
            >
              ⌘K
            </kbd>
          </button>
          <a href="/#catalog" className={NAV_LINK_CLASS}>
            Catalog
          </a>
          <Link to="/draw" className={NAV_LINK_CLASS}>
            Draw
          </Link>
          <Link to="/about" className={NAV_LINK_CLASS}>
            About
          </Link>
          <Link
            to="/quiz"
            className="btn-foil ml-1 hidden items-center rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:inline-flex"
          >
            The Screening
          </Link>
          <MobileNavMenu />
        </nav>
      </div>
    </header>
  );
}

function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  const itemClass =
    "rounded-md px-3 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-cream/85 hover:bg-parchment hover:text-cream";
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="sm:hidden grid size-10 place-items-center rounded-md border border-line bg-muted-ink text-cream transition-colors hover:border-gold-deep hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <Menu className="size-4" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-72 border-l border-line bg-ink text-cream p-6 flex flex-col gap-6"
      >
        <SheetHeader className="p-0 text-left">
          <SheetTitle className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/60">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openPalette();
            }}
            className="rounded-md border border-gold/40 bg-gold/5 px-3 py-3 text-left font-mono text-[12px] uppercase tracking-[0.16em] text-gold hover:bg-gold/15"
          >
            Search the atlas
          </button>
          <Link to="/" onClick={() => setOpen(false)} className={itemClass}>
            Atlas home
          </Link>
          <a href="/#catalog" onClick={() => setOpen(false)} className={itemClass}>
            The full catalog
          </a>
          <Link to="/quiz" onClick={() => setOpen(false)} className={itemClass}>
            The Screening · quiz
          </Link>
          <Link to="/draw" onClick={() => setOpen(false)} className={itemClass}>
            Draw a card
          </Link>
          <Link to="/about" onClick={() => setOpen(false)} className={itemClass}>
            About
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
