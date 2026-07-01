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
      { name: "google-site-verification", content: "F-ok54a0ZpD_GxS2EzRGVLtizwV1MJs_hqyWBSpUp7M" },
      { title: "The Lovable Feature Atlas — Every Lovable Feature, Every Release" },
      {
        name: "description",
        content:
          "An independent, fan-built catalog of every Lovable feature, beta, and release through 2026. Filter, search, and explore 294 features across 18 categories.",
      },
      { name: "author", content: "Alicia Dahling" },
      { property: "og:site_name", content: "The Lovable Feature Atlas" },
      { property: "og:title", content: "The Lovable Feature Atlas — Every Lovable Feature, Every Release" },
      {
        property: "og:description",
        content:
          "The complete, current catalog of every Lovable feature, beta, and release.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://lovable-feature-atlas.lovable.app/og-image.jpg" },
      { property: "og:image:width", content: "1216" },
      { property: "og:image:height", content: "640" },
      { property: "og:image:alt", content: "The Lovable Feature Atlas — community catalog of every Lovable feature, beta, and release." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable Feature Atlas — Community Release Catalog" },
      {
        name: "twitter:description",
        content:
          "The complete, current catalog of every Lovable feature, beta, and release.",
      },
      { name: "twitter:image", content: "https://lovable-feature-atlas.lovable.app/og-image.jpg" },
      {
        name: "twitter:image:alt",
        content:
          "The Lovable Feature Atlas — community catalog of every Lovable feature, beta, and release.",
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
        <nav className="fixed top-0 right-0 z-50 p-6 lg:p-8">
          <ThemeToggle />
        </nav>
        <Outlet />
        <Footer />
        <SeoDebugPanel />
      </LenisProvider>
    </QueryClientProvider>
  );
}
