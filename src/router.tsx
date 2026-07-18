import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const isClient = typeof window !== "undefined";

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Keep TanStack restoration for client-side navigation, but do not emit
    // its SSR inline reset. With streamed HTML that script can arrive after a
    // visitor has already scrolled and unexpectedly move the page back to 0.
    scrollRestoration: isClient,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 0,
    // Wrap every navigation in a View Transition (200ms crossfade + scale).
    // Browsers without the API silently no-op via TanStack's built-in fallback.
    defaultViewTransition: true,
  });

  // The first client render is hydration, not a navigation. Skipping that
  // one reset preserves any scroll the visitor makes while the stream settles;
  // later link and Back-button navigations still use TanStack restoration.
  // `resetNextScroll` is a runtime instance field not present in RouterCore's
  // public types, so assign it via a typed alias rather than a bare cast.
  if (isClient) {
    const scrollControl = router as unknown as { resetNextScroll: boolean };
    scrollControl.resetNextScroll = false;
  }

  return router;
};
