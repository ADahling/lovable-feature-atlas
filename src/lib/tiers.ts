export interface Tier {
  name: string;
  min: number; // inclusive percentage 0-100
  max: number; // inclusive percentage
  blurb: string;
}

export const TIERS: Tier[] = [
  { name: "Tourist", min: 0, max: 9, blurb: "Just passing through." },
  { name: "Weekend Builder", min: 10, max: 24, blurb: "Ships on the side." },
  { name: "Shipper", min: 25, max: 44, blurb: "Actually puts things live." },
  { name: "Power Builder", min: 45, max: 64, blurb: "Knows every menu." },
  { name: "Atlas Cartographer", min: 65, max: 84, blurb: "Charts uncharted features." },
  { name: "Lovable Completionist", min: 85, max: 100, blurb: "Has clicked everything." },
];

export function tierForPercent(pct: number): Tier {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    TIERS.find((t) => clamped >= t.min && clamped <= t.max) ?? TIERS[0]
  );
}
