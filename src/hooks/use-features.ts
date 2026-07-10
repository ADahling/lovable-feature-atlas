import type { FeatureCard } from "../lib/features.functions";
import { getRouteApi } from "@tanstack/react-router";

const rootApi = getRouteApi("__root__");

export interface UseFeaturesResult {
  features: FeatureCard[];
  generatedAt: string | null;
  source: "live" | "bundled";
}

/**
 * Reads the feature list from the root loader (SSR-embedded). The bundled
 * fallback dataset is never imported into the client bundle — the server
 * fn `getFeatures` falls back to it on the server if the DB read fails,
 * so by the time this hook runs the loader has already picked a source.
 * If the loader payload is somehow empty we return `[]` rather than
 * ship the 277 KB static file to every visitor.
 */
export function useFeatures(): UseFeaturesResult {
  const ctx = rootApi.useLoaderData() as
    | {
        features: FeatureCard[] | null;
        generatedAt: string | null;
        source: "live" | "bundled";
      }
    | undefined;

  if (ctx && ctx.features && ctx.features.length > 0) {
    return {
      features: ctx.features,
      generatedAt: ctx.generatedAt,
      source: ctx.source,
    };
  }
  return { features: [], generatedAt: null, source: "bundled" };
}
