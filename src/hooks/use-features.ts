import { features as bundledFeatures } from "../data/features";
import type { FeatureCard } from "../lib/features.functions";
import { getRouteApi } from "@tanstack/react-router";

const rootApi = getRouteApi("__root__");

// Card-level projection of the bundled fallback dataset. Mirrors the server
// loader's shape so consumers see identical fields regardless of source.
const bundledCards: FeatureCard[] = bundledFeatures.map((f) => ({
  id: f.id,
  name: f.name,
  category: f.category,
  status: f.status,
  releaseDate: f.releaseDate,
  pricing: f.pricing,
  icon: f.icon,
  tagline: f.tagline,
}));

export interface UseFeaturesResult {
  features: FeatureCard[];
  generatedAt: string | null;
  source: "live" | "bundled";
}

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
  return { features: bundledCards, generatedAt: null, source: "bundled" };
}
