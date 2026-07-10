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

/*
 * Category identity palette — one hue token per category, two lightness
 * variants (dark = for use on ink #0A0A0A, light = for use on cream
 * #F6EEDD). Every value below is WCAG AA (contrast ≥ 4.5:1) against the
 * corresponding page background. Hues are restrained and harmonious with
 * the brand's forest-green / gold / cream; never rainbow-bright.
 *
 * Consumed everywhere a category appears — filter pills, card glyphs,
 * timeline markers, constellation clusters, quiz section headers, draw
 * card category line, category pages, feature detail chips — via
 * `accentForCategory(name, theme)` or the CSS variable `--cat-<slug>`
 * emitted per theme in src/styles.css. Small-surface-area only: dots,
 * glyphs, chips, thin rules — never large fills.
 */
export interface CategoryAccent {
  /** Slugified category name (matches --cat-<slug> CSS variables). */
  slug: string;
  /** AA-passing hex on the dark ink background. */
  dark: string;
  /** AA-passing hex on the cream paper background. */
  light: string;
}

const CATEGORY_ACCENTS: Record<string, { dark: string; light: string; slug: string }> = {
  "AI Models":        { slug: "ai-models",       dark: "#B49AF0", light: "#6B4FB8" }, // electric violet
  Agent:              { slug: "agent",           dark: "#CFC28A", light: "#6B5E28" }, // olive gold
  "App Connectors":   { slug: "app-connectors",  dark: "#6BC0B4", light: "#1F6B62" }, // teal
  Cloud:              { slug: "cloud",           dark: "#8FBFE6", light: "#2867A8" }, // atmospheric blue
  Community:          { slug: "community",       dark: "#E1A8B2", light: "#8E4757" }, // rose
  Deploy:             { slug: "deploy",          dark: "#6DD3A9", light: "#1B7A54" }, // bright emerald
  Editor:             { slug: "editor",          dark: "#E8998A", light: "#A85340" }, // coral
  Email:              { slug: "email",           dark: "#E3C078", light: "#8A6820" }, // warm gold
  Integrations:       { slug: "integrations",    dark: "#7ACBC3", light: "#1E6B65" }, // cyan
  "MCP Connectors":   { slug: "mcp-connectors",  dark: "#98BFA8", light: "#2F6350" }, // deep sage
  Mobile:             { slug: "mobile",          dark: "#9BD1BE", light: "#28755F" }, // seafoam
  Platform:           { slug: "platform",        dark: "#B0BCC0", light: "#4E5E62" }, // slate
  Productivity:       { slug: "productivity",    dark: "#E4B78F", light: "#8B5620" }, // apricot
  Publishing:         { slug: "publishing",      dark: "#D8A97F", light: "#87551E" }, // bronze
  Security:           { slug: "security",        dark: "#E4B858", light: "#7E5810" }, // amber
  Testing:            { slug: "testing",         dark: "#B7CFA6", light: "#4C6A3A" }, // sage
  Workflow:           { slug: "workflow",        dark: "#B0C862", light: "#5D7820" }, // acid green
  Workspace:          { slug: "workspace",       dark: "#CFC885", light: "#5F5A24" }, // khaki
};

const FALLBACK_ACCENT = { slug: "default", dark: "#1F7A5A", light: "#094836" };

/**
 * Accent hex for a category in the requested theme.
 * Both values pass WCAG AA against the corresponding page background.
 * Prefer `categoryAccentVar(name)` for React components — it resolves
 * automatically as the theme toggles.
 */
export function accentForCategory(name: string, theme: "dark" | "light" = "dark"): string {
  const entry = CATEGORY_ACCENTS[name] ?? FALLBACK_ACCENT;
  return theme === "light" ? entry.light : entry.dark;
}

/**
 * CSS `var(--cat-<slug>)` reference — resolves per theme, so use this in
 * inline styles instead of hardcoding a hex per component.
 */
export function categoryAccentVar(name: string): string {
  const entry = CATEGORY_ACCENTS[name] ?? FALLBACK_ACCENT;
  return `var(--cat-${entry.slug})`;
}

/** Slug used in the CSS variable name for a category. */
export function categoryAccentSlug(name: string): string {
  return (CATEGORY_ACCENTS[name] ?? FALLBACK_ACCENT).slug;
}

/**
 * Full accent record for a category (both theme variants + slug). Useful
 * for canvas/WebGL surfaces that can't consume CSS variables.
 */
export function categoryAccent(name: string): CategoryAccent {
  const entry = CATEGORY_ACCENTS[name] ?? FALLBACK_ACCENT;
  return { slug: entry.slug, dark: entry.dark, light: entry.light };
}

/**
 * Dark-theme tint for a category. Retained for Three.js / canvas surfaces
 * (constellation, hero starfield) that render against ink and need a real
 * color value at build time rather than a CSS variable.
 */
export function tintForCategory(name: string): string {
  return (CATEGORY_ACCENTS[name] ?? FALLBACK_ACCENT).dark;
}

// Canonical outbound UTM query for referral attribution.
export const LOVABLE_UTM = "utm_source=feature-atlas&utm_medium=referral&utm_campaign=atlas";

// Affiliate referral link for the owner's Lovable partner code. All outbound
// "Start building on Lovable" CTAs should use this href and set rel="sponsored".
export const LOVABLE_AFFILIATE_HREF = `https://lovable.dev/?via=iheartlovable&${LOVABLE_UTM}`;

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
