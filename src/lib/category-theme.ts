// Category-coded gradient blends built from the atlas brand family
// (deep ink base, emerald/forest, antique gold, warm cream). Each of the 18
// categories gets a distinct but disciplined hue mix — no rainbow chips, no
// off-brand colors. Consumed by the feature detail page header banner.

export interface CategoryTheme {
  // CSS background value (a linear-gradient) applied behind the header band.
  gradient: string;
  // Chip / accent color used for eyebrow text and marker glyphs.
  accent: string;
  // Border color for the accent chip.
  border: string;
}

const DEFAULT: CategoryTheme = {
  gradient:
    "linear-gradient(135deg, rgba(11,61,46,0.55) 0%, rgba(31,122,90,0.30) 45%, rgba(10,10,10,0.0) 100%)",
  accent: "#1F7A5A",
  border: "rgba(31,122,90,0.35)",
};

const THEMES: Record<string, CategoryTheme> = {
  "AI Models": {
    gradient:
      "linear-gradient(135deg, rgba(31,122,90,0.55) 0%, rgba(201,169,97,0.22) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  Agent: {
    gradient:
      "linear-gradient(120deg, rgba(11,61,46,0.7) 0%, rgba(31,122,90,0.5) 50%, rgba(201,169,97,0.18) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  "App Connectors": {
    gradient:
      "linear-gradient(135deg, rgba(31,122,90,0.4) 0%, rgba(11,61,46,0.55) 60%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Cloud: {
    gradient:
      "linear-gradient(145deg, rgba(11,61,46,0.6) 0%, rgba(31,122,90,0.35) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Community: {
    gradient:
      "linear-gradient(135deg, rgba(201,169,97,0.35) 0%, rgba(31,122,90,0.25) 60%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  Deploy: {
    gradient:
      "linear-gradient(115deg, rgba(31,122,90,0.55) 0%, rgba(11,61,46,0.45) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Editor: {
    gradient:
      "linear-gradient(135deg, rgba(31,122,90,0.5) 0%, rgba(201,169,97,0.18) 50%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Email: {
    gradient:
      "linear-gradient(140deg, rgba(201,169,97,0.28) 0%, rgba(11,61,46,0.5) 60%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  Integrations: {
    gradient:
      "linear-gradient(125deg, rgba(11,61,46,0.55) 0%, rgba(31,122,90,0.4) 50%, rgba(201,169,97,0.15) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  "MCP Connectors": {
    gradient:
      "linear-gradient(135deg, rgba(31,122,90,0.5) 0%, rgba(11,61,46,0.6) 60%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Mobile: {
    gradient:
      "linear-gradient(150deg, rgba(11,61,46,0.5) 0%, rgba(201,169,97,0.2) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  Platform: {
    gradient:
      "linear-gradient(120deg, rgba(31,122,90,0.55) 0%, rgba(11,61,46,0.55) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Productivity: {
    gradient:
      "linear-gradient(135deg, rgba(201,169,97,0.3) 0%, rgba(31,122,90,0.35) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  Publishing: {
    gradient:
      "linear-gradient(130deg, rgba(11,61,46,0.6) 0%, rgba(201,169,97,0.22) 50%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  Security: {
    gradient:
      "linear-gradient(140deg, rgba(11,61,46,0.7) 0%, rgba(31,122,90,0.35) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Testing: {
    gradient:
      "linear-gradient(125deg, rgba(31,122,90,0.45) 0%, rgba(11,61,46,0.5) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#1F7A5A",
    border: "rgba(31,122,90,0.4)",
  },
  Workflow: {
    gradient:
      "linear-gradient(115deg, rgba(11,61,46,0.55) 0%, rgba(201,169,97,0.2) 60%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
  Workspace: {
    gradient:
      "linear-gradient(135deg, rgba(31,122,90,0.4) 0%, rgba(201,169,97,0.22) 55%, rgba(10,10,10,0.0) 100%)",
    accent: "#C9A961",
    border: "rgba(201,169,97,0.4)",
  },
};

export function themeForCategory(name: string): CategoryTheme {
  return THEMES[name] ?? DEFAULT;
}

// Canonical outbound UTM query for referral attribution.
export const LOVABLE_UTM = "utm_source=feature-atlas&utm_medium=referral&utm_campaign=atlas";

/** Append the atlas UTM params to any absolute docs.lovable.dev / lovable.dev URL. */
export function withAtlasUtm(url: string): string {
  try {
    const u = new URL(url);
    if (!/lovable\.(dev|app)$/i.test(u.hostname)) return url;
    u.searchParams.set("utm_source", "feature-atlas");
    u.searchParams.set("utm_medium", "referral");
    u.searchParams.set("utm_campaign", "atlas");
    return u.toString();
  } catch {
    return url;
  }
}
