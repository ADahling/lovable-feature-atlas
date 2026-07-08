import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 0,
    // Wrap every navigation in a View Transition (200ms crossfade + scale).
    // Browsers without the API silently no-op via TanStack's built-in fallback.
    defaultViewTransition: true,
  });

  return router;
};

