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

  return router;
};
