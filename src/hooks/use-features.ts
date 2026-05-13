import { features as bundledFeatures, type Feature } from "../data/features";
import { getRouteApi } from "@tanstack/react-router";

const rootApi = getRouteApi("__root__");

export interface UseFeaturesResult {
  features: Feature[];
  generatedAt: string | null;
  source: "live" | "bundled";
}

export function useFeatures(): UseFeaturesResult {
  const ctx = rootApi.useLoaderData() as
    | {
        features: Feature[] | null;
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
  return { features: bundledFeatures, generatedAt: null, source: "bundled" };
}
