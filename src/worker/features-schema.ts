import { z } from "zod";

export const FeatureRecord = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  status: z.enum(["GA", "Beta", "Removed"]),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pricing: z.string().min(1),
  icon: z.string(),
  tagline: z.string().min(1),
  description: z.string().min(1),
  capabilities: z.array(z.string()),
  useCases: z.array(z.string()),
  source: z.string().url(),
});

export type FeatureRecord = z.infer<typeof FeatureRecord>;

export const FeatureDataset = z.object({
  version: z.string(),
  generatedAt: z.string(),
  count: z.number().int().nonnegative(),
  features: z.array(FeatureRecord),
});

export type FeatureDataset = z.infer<typeof FeatureDataset>;
