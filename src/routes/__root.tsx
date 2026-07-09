import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Menu } from "lucide-react";

import appCss from "../styles.css?url";
import { LenisProvider } from "../components/atlas/LenisProvider";
import { CustomCursor } from "../components/atlas/CustomCursor";
import { ThemeToggle } from "../components/atlas/ThemeToggle";
import { Footer } from "../components/atlas/Footer";
import { getFeatures } from "../lib/features.functions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";

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
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%231F7A5A'/><stop offset='100%25' stop-color='%23C9A961'/></linearGradient></defs><rect width='64' height='64' rx='12' fill='%230A0A0A'/><path d='M32 50L14 32C9 27 9 19 14 14C19 9 27 9 32 14C37 9 45 9 50 14C55 19 55 27 50 32L32 50Z' fill='url(%23g)'/></svg>",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
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
              jobTitle: "CFO | Finance Leader | Angel Investor | STEM Advocate",
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
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Apply stored theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('atlas-theme');if(t==='light'){document.documentElement.setAttribute('data-theme','light');document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
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

  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <CustomCursor />
        <nav className="absolute sm:fixed top-0 right-0 z-50 flex items-center gap-3 p-4 sm:p-6 lg:p-8">
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
