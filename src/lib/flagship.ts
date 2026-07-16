/**
 * Flagship feature set — the ~40 marquee Lovable features that define the
 * platform. Powers the quiz's QUICK mode: a 90-second self-assessment that
 * ends at a shareable score instead of a 371-checkbox marathon.
 *
 * Curation rules:
 *  - one entry per capability (no near-duplicate releases),
 *  - spread across categories so every builder type scores somewhere,
 *  - ids must exist in the features dataset (validated in CI by usage).
 */
export const FLAGSHIP_IDS: readonly string[] = [
  // Agent
  "agent-mode",
  "plan-mode",
  "chat-mode-clarifying-questions",
  "smarter-agent",
  "autonomous-complex-builds",
  "subagents",
  "prompt-queue",
  "lovable-mcp-server",
  // Editor
  "voice-mode",
  "code-mode",
  "visual-edits",
  "design-templates",
  "image-understanding",
  // Workflow
  "command-palette",
  "publish-from-chat",
  "analytics",
  "remix-experience",
  // Cloud
  "lovable-cloud",
  "cloud-database",
  "cloud-auth-email-phone",
  "cloud-edge-functions",
  "cloud-storage",
  "test-and-live-environments",
  "seo-and-ai-search",
  // AI Models
  "lovable-ai-gateway",
  "claude-opus-4-7",
  "gpt-5-5",
  "gemini-3-1-pro",
  "nano-banana-2",
  // Integrations & Connectors
  "supabase",
  "github-sync",
  "stripe",
  "app-connectors",
  // Deploy & Publishing
  "custom-domain",
  // Security
  "security-center",
  "two-factor-authentication",
  // Workspace & Mobile
  "mobile-app",
  "lovable-desktop-app",
  "project-knowledge",
  // Testing
  "browser-testing",
] as const;

export const FLAGSHIP_SET: ReadonlySet<string> = new Set(FLAGSHIP_IDS);
