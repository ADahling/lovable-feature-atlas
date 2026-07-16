import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Menu } from "lucide-react";

import appCss from "../styles.css?url";
import { LenisProvider } from "../components/atlas/LenisProvider";
import { CustomCursor } from "../components/atlas/CustomCursor";
import { Oracle } from "../components/atlas/Oracle";
import { ThemeToggle } from "../components/atlas/ThemeToggle";
import { Footer } from "../components/atlas/Footer";
import { getFeatures } from "../lib/features.functions";
import { HEART_PATH_D, HEART_VIEW_BOX } from "../lib/heart-path";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
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
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%231F7A5A'/><stop offset='100%25' stop-color='%23C9A961'/></linearGradient></defs><rect width='64' height='64' rx='12' fill='%230A0A0A'/><path d='M32 58C20 48 2 38 2 22C2 8 20 2 32 18C44 2 62 8 62 22C62 38 44 48 32 58Z' fill='url(%23g)'/></svg>",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
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
              description:
                "An editorial catalog of every Lovable feature, beta, and release.",
              author: { "@id": "https://atlas.dahlingdigital.com/#curator" },
              creator: { "@id": "https://atlas.dahlingdigital.com/#curator" },
            },
          ],
        }),
      },
    ],
  }),
  loader: () => getFeatures(),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  // Cinematic first-visit intro. The loader is NEVER rendered by React or
  // baked into the prerender snapshot — it exists only as a template string
  // inside the inline boot script below, which constructs and injects the
  // DOM at runtime. This makes it immune to:
  //   - prerender snapshots capturing a post-kill state (empty island)
  //   - React reconciliation re-injecting stale markup on theme toggles
  //   - hydration mismatches
  //
  // Timings: 550ms fade-in, 900ms hold, 1100ms fade-out (~2.55s total).
  // Click-to-skip → 220ms fade. Reduced-motion → ~180ms fast path.
  //
  // Kill semantics: sessionStorage flag `atlas-thematic-loader-seen` set on
  // first render. If set on a later navigation in the same session, nothing
  // is injected. If NOT set, the script first strips any stale
  // data-atlas-loader-* attributes the prerender snapshot may have baked
  // onto <html>, then injects and plays.
  const heartSvg = `<svg viewBox="${HEART_VIEW_BOX}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" width="100%" height="100%"><defs><linearGradient id="atlas-loader-heart-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop data-stop="0" offset="0%" stop-color="#1F7A5A"></stop><stop data-stop="1" offset="55%" stop-color="#0B3D2E"></stop><stop data-stop="2" offset="100%" stop-color="#C9A961"></stop></linearGradient></defs><path d="${HEART_PATH_D}" fill="url(#atlas-loader-heart-grad)"></path></svg>`;

  const loaderInnerHtml = `<div style="display:flex;flex-direction:column;align-items:center;animation:atlasLoaderRise 900ms cubic-bezier(0.22,1,0.36,1) both"><div data-loader-heart style="width:72px;height:72px;filter:drop-shadow(0 0 24px rgba(31,122,90,0.55));animation:atlasLoaderHeartbeat 1600ms ease-in-out infinite">${heartSvg}</div><p data-loader-title style="font-family:'JetBrains Mono', ui-monospace, monospace;text-transform:uppercase;letter-spacing:0.32em;font-size:11px;color:#C9A961;margin:20px 0 0 0;text-align:center">The Lovable Feature Atlas</p><p data-loader-sub style="font-family:Geist, ui-sans-serif, system-ui, sans-serif;font-size:13px;color:#FBF5E9;opacity:.75;margin:8px 0 0 0;text-align:center">Curated by Alicia Dahling</p></div>`;

  const preBootScript = `(function(){var D=document.documentElement;var K='atlas-thematic-loader-seen';function markDone(){D.setAttribute('data-atlas-loader-done','1');D.setAttribute('data-atlas-loader-seen','1');try{window.__atlasLoaderKilled=true;}catch(e){}try{window.dispatchEvent(new Event('atlas:loader-killed'));}catch(e){}}function kill(){try{markDone();var n=document.getElementById('atlas-thematic-loader');if(n&&n.parentNode)n.parentNode.removeChild(n);}catch(e){}}try{var t=localStorage.getItem('atlas-theme');if(t==='light'){D.setAttribute('data-theme','light');D.classList.remove('dark');}var seen=false;try{seen=sessionStorage.getItem(K)==='1';}catch(e){}if(seen||window.__atlasLoaderKilled){markDone();return;}D.removeAttribute('data-atlas-loader-done');D.removeAttribute('data-atlas-loader-seen');try{sessionStorage.setItem(K,'1');}catch(e){}var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var IN=reduce?60:550,HOLD=reduce?60:900,OUT=reduce?180:1100;var el=document.createElement('div');el.id='atlas-thematic-loader';el.setAttribute('aria-hidden','true');el.style.opacity='0';el.innerHTML=${JSON.stringify(loaderInnerHtml)};(document.body||document.documentElement).appendChild(el);var mv=function(){if(document.body&&el.parentNode!==document.body){document.body.appendChild(el);}};if(!document.body){document.addEventListener('DOMContentLoaded',mv,{once:true});}el.style.transition='opacity '+IN+'ms cubic-bezier(0.22,1,0.36,1)';requestAnimationFrame(function(){requestAnimationFrame(function(){el.style.opacity='1';});});var fade=function(){var e=document.getElementById('atlas-thematic-loader');if(!e){markDone();return;}e.style.transition='opacity '+OUT+'ms cubic-bezier(0.4,0,0.4,1)';e.style.opacity='0';e.style.pointerEvents='none';setTimeout(kill,OUT+40);};var click=function(){var e=document.getElementById('atlas-thematic-loader');if(!e)return;e.style.transition='opacity 220ms ease-out';e.style.opacity='0';e.style.pointerEvents='none';setTimeout(kill,240);};el.addEventListener('click',click,{once:true});setTimeout(fade,IN+HOLD);}catch(e){kill();}setTimeout(function(){kill();},3500);})();`;

  const loaderStyles = `@keyframes atlasLoaderRise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes atlasLoaderHeartbeat{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}#atlas-thematic-loader{position:fixed;inset:0;z-index:9999;cursor:pointer;display:grid;place-items:center;will-change:opacity;background:radial-gradient(120% 90% at 50% 50%, #0d2118 0%, #060606 55%, #000 100%);pointer-events:auto;}html[data-atlas-loader-seen="1"] #atlas-thematic-loader,html[data-atlas-loader-done="1"] #atlas-thematic-loader{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}:root[data-theme="light"] #atlas-thematic-loader{background:radial-gradient(120% 90% at 50% 42%, #FBF5E9 0%, #F2E5C8 52%, #E1C982 100%)!important;}:root[data-theme="light"] #atlas-thematic-loader [data-loader-heart]{filter:drop-shadow(0 2px 8px rgba(73,56,21,0.28))!important;}:root[data-theme="light"] #atlas-thematic-loader p[data-loader-title]{color:#6B5423!important;}:root[data-theme="light"] #atlas-thematic-loader p[data-loader-sub]{color:#0A0A0A!important;opacity:.8!important;}:root[data-theme="light"] #atlas-thematic-loader stop[data-stop="0"]{stop-color:#D8BC77!important;}:root[data-theme="light"] #atlas-thematic-loader stop[data-stop="1"]{stop-color:#C9A961!important;}:root[data-theme="light"] #atlas-thematic-loader stop[data-stop="2"]{stop-color:#8A6B2E!important;}:root[data-theme="light"] [data-atlas-hero-fallback]{opacity:0!important;visibility:hidden!important;}`;

  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: loaderStyles }} />
        <script dangerouslySetInnerHTML={{ __html: preBootScript }} />
        <HeadContent />
      </head>
      <body className="bg-ink text-cream font-sans antialiased" suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Safety net: once dismissed the loader is gone for the whole session,
  // regardless of theme toggling or any other re-render churn. We watch
  // the session flag and permanently mark the document.
  useEffect(() => {
    const forceRemove = () => {
      try {
        document.documentElement.setAttribute("data-atlas-loader-done", "1");
        document.documentElement.setAttribute("data-atlas-loader-seen", "1");
        (window as unknown as { __atlasLoaderKilled?: boolean }).__atlasLoaderKilled = true;
        document.getElementById("atlas-thematic-loader")?.remove();
      } catch {
        // ignore
      }
    };
    // Absolute cap: after 3.5s the loader must be gone no matter what.
    const t = window.setTimeout(forceRemove, 3500);
    return () => window.clearTimeout(t);
  }, []);



  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // The /constellation route stays on the dark sky material in BOTH themes
  // by design. In light theme the site nav would otherwise render as a
  // cream band above the black sky and create a hard seam — remap the
  // local --ink and --cream tokens so every descendant (bg-ink, text-cream,
  // border-cream) resolves to the dark palette regardless of theme.
  const onConstellation = pathname === "/constellation";
  const navStyle: React.CSSProperties = onConstellation
    ? ({
        "--ink": "#0A0A0A",
        "--cream": "#FBF5E9",
        "--gold": "#C9A961",
        "--gold-soft": "#E0C788",
      } as React.CSSProperties)
    : {};

  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <CustomCursor />
        <nav
          className="absolute sm:fixed top-0 right-0 z-50 flex items-center gap-3 p-4 sm:p-6 lg:p-8"
          style={navStyle}
        >
          <div className="flex items-center gap-2 rounded-full border border-cream/10 bg-ink/85 px-2 py-1.5 backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]">
            <Link
              to="/about"
              className="hidden sm:inline-flex items-center rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/60 transition-colors hover:text-cream"
            >
              About
            </Link>
            <Link
              to="/draw"
              className="hidden sm:inline-flex items-center rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/60 transition-colors hover:text-cream"
            >
              Draw
            </Link>
            <Link
              to="/quiz"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              Quiz
            </Link>
            <MobileNavMenu />
            <ThemeToggle />
          </div>
        </nav>
        <Outlet />
        <Footer />
        <Oracle />
        {/* Thematic intro loader is now SSR-rendered directly in RootShell
            (see below) so it covers the very first painted frame. An inline
            sync script in RootShell hides it for returning visitors and
            schedules its fade-out on first visit. */}
      </LenisProvider>
    </QueryClientProvider>
  );
}

function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="sm:hidden grid size-10 place-items-center rounded-full border border-cream/15 bg-muted-ink text-cream transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <Menu className="size-4" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-72 border-l border-cream/10 bg-ink text-cream p-6 flex flex-col gap-6"
      >
        <SheetHeader className="p-0 text-left">
          <SheetTitle className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/50">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-cream/85 hover:bg-emerald/10 hover:text-cream"
          >
            Atlas home
          </Link>
          <Link
            to="/quiz"
            onClick={() => setOpen(false)}
            className="rounded-md border border-gold/40 bg-gold/5 px-3 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-gold hover:bg-gold/15"
          >
            Quiz
          </Link>
          <Link
            to="/draw"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-cream/85 hover:bg-emerald/10 hover:text-cream"
          >
            Draw a card
          </Link>
          <Link
            to="/about"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-cream/85 hover:bg-emerald/10 hover:text-cream"
          >
            About
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
