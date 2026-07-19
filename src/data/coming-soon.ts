/**
 * Coming Attractions — forthcoming Lovable capabilities the official record
 * has already signaled (beta, research preview, gradual rollout, announced)
 * plus clearly-labeled community rumors when they have a public source.
 *
 * Curation rules:
 *  - Every entry carries a `source` URL and a `sourcedAt` date. No entry
 *    ships without a public source; "rumored" entries must say who said it.
 *  - The section runs itself: an entry auto-retires from the page the
 *    moment the nightly catalog refresh picks up a released feature whose
 *    id matches `matchIds` (or whose name matches `matchName`), and
 *    entries older than STALE_AFTER_DAYS are hidden until re-verified.
 *  - Status ladder mirrors film ratings: BETA and PREVIEW are screening
 *    now for some audiences; ROLLING OUT is in limited release; ANNOUNCED
 *    is greenlit; RUMORED is unverified festival chatter.
 */

export type ComingStatus = "Beta" | "Preview" | "Rolling out" | "Announced" | "Rumored";

export interface ComingAttraction {
  id: string;
  name: string;
  status: ComingStatus;
  tagline: string;
  category: string;
  /** Public source for the claim. */
  source: string;
  sourceLabel: string;
  /** ISO date the source was last verified. */
  sourcedAt: string;
  /** Released-catalog ids that indicate this has shipped (auto-retire). */
  matchIds: string[];
  /** Case-insensitive substring of a released feature name (auto-retire). */
  matchName?: string;
}

/** Entries older than this are hidden until the date is re-verified. */
export const STALE_AFTER_DAYS = 120;

export const comingSoon: ComingAttraction[] = [
  {
    id: "project-monitoring",
    name: "Project Monitoring",
    status: "Beta",
    tagline:
      "Lovable checks your app on a schedule — reviewing code and watching for visitor-facing errors before your users hit them.",
    category: "Platform",
    source: "https://docs.lovable.dev/changelog",
    sourceLabel: "Official changelog · beta",
    sourcedAt: "2026-07-19",
    matchIds: ["project-monitoring"],
    matchName: "project monitoring",
  },
  {
    id: "lovable-mcp-server-ga",
    name: "Lovable MCP Server",
    status: "Preview",
    tagline:
      "External AI clients manage your Lovable projects over MCP — currently a research preview on the road to general availability.",
    category: "Integrations",
    source: "https://docs.lovable.dev/changelog",
    sourceLabel: "Official changelog · research preview",
    sourcedAt: "2026-07-19",
    matchIds: ["lovable-mcp-server-ga"],
    matchName: "mcp server general",
  },
  {
    id: "workspace-identity-reuse",
    name: "Workspace Identity Reuse",
    status: "Rolling out",
    tagline:
      "Published apps recognize signed-in Lovable users automatically — one identity across every app your workspace ships.",
    category: "Security",
    source: "https://docs.lovable.dev/changelog",
    sourceLabel: "Official changelog · gradual rollout",
    sourcedAt: "2026-07-19",
    matchIds: ["workspace-identity-reuse"],
    matchName: "workspace identity",
  },
  {
    id: "desktop-windows",
    name: "Lovable Desktop for Windows",
    status: "Announced",
    tagline:
      "The desktop app arrives on Windows — macOS shipped first, Windows support is announced as coming.",
    category: "Platform",
    source: "https://docs.lovable.dev/changelog",
    sourceLabel: "Official changelog · announced",
    sourcedAt: "2026-07-19",
    matchIds: ["desktop-windows", "lovable-desktop-windows"],
    matchName: "windows",
  },
  {
    id: "gemini-tts-ga",
    name: "Gemini TTS Voices, GA",
    status: "Preview",
    tagline:
      "Gemini 3.1 Flash TTS and Flash Lite Preview TTS bring narrated apps closer — preview voices ahead of general availability.",
    category: "AI Models",
    source: "https://docs.lovable.dev/changelog",
    sourceLabel: "Official changelog · preview models",
    sourcedAt: "2026-07-19",
    matchIds: ["gemini-tts", "gemini-3-1-flash-tts"],
    matchName: "tts",
  },
];
