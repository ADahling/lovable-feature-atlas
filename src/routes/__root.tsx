import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LenisProvider } from "../components/atlas/LenisProvider";
import { CustomCursor } from "../components/atlas/CustomCursor";
import { ThemeToggle } from "../components/atlas/ThemeToggle";
import { Footer } from "../components/atlas/Footer";
import { getFeatures } from "../lib/features.functions";

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
      { title: "Lovable Feature Atlas" },
      {
        name: "description",
        content:
          "The complete, current catalog of every Lovable feature, beta, and release — from Agent Mode to the May 2026 SEO/AEO launch. Built for ambassadors, builders, and teams evaluating Lovable.",
      },
      { name: "author", content: "Alicia Dahling" },
      { property: "og:site_name", content: "Lovable Feature Atlas" },
      { property: "og:title", content: "Lovable Feature Atlas" },
      {
        property: "og:description",
        content:
          "The complete, current catalog of every Lovable feature, beta, and release.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable Feature Atlas" },
      {
        name: "twitter:description",
        content:
          "The complete, current catalog of every Lovable feature, beta, and release.",
      },
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
              "@type": "Organization",
              name: "Dahling Digital",
              url: "https://dahlingdigital.com",
              founder: { "@type": "Person", name: "Alicia Dahling" },
            },
            {
              "@type": "WebSite",
              name: "Lovable Feature Atlas",
              url: "https://lovable-feature-atlas.lovable.app",
              description:
                "An editorial catalog of every Lovable feature, beta, and release.",
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
    <html lang="en" className="dark" data-theme="dark">
      <head>
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

  return (
    <QueryClientProvider client={queryClient}>
      <LenisProvider>
        <CustomCursor />
        <nav className="fixed top-0 right-0 z-50 p-6 lg:p-8">
          <ThemeToggle />
        </nav>
        <Outlet />
        <Footer />
      </LenisProvider>
    </QueryClientProvider>
  );
}
