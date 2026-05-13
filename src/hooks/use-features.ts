import { features as bundledFeatures, type Feature } from "../data/features";

export interface UseFeaturesResult {
  features: Feature[];
}

export function useFeatures(): UseFeaturesResult {
  return { features: bundledFeatures };
}
