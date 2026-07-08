// Category → lucide icon mapping used for the watermark glyph on feature
// cards and anywhere else the Atlas wants a quiet visual signature for
// a category. Icons are chosen to feel authored, not scaffolded — one
// distinct silhouette per category, none reused.

import {
  Boxes,
  Bot,
  Plug,
  Cloud,
  Users,
  Rocket,
  Code2,
  Mail,
  Zap,
  Waypoints,
  Smartphone,
  LayoutGrid,
  ListChecks,
  Globe as GlobeIcon,
  ShieldCheck,
  FlaskConical,
  Workflow,
  Briefcase,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "AI Models": Boxes,
  Agent: Bot,
  "App Connectors": Plug,
  Cloud: Cloud,
  Community: Users,
  Deploy: Rocket,
  Editor: Code2,
  Email: Mail,
  Integrations: Zap,
  "MCP Connectors": Waypoints,
  Mobile: Smartphone,
  Platform: LayoutGrid,
  Productivity: ListChecks,
  Publishing: GlobeIcon,
  Security: ShieldCheck,
  Testing: FlaskConical,
  Workflow: Workflow,
  Workspace: Briefcase,
};

export function iconForCategory(name: string): LucideIcon {
  return MAP[name] ?? Sparkles;
}
