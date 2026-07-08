// Small abstract visuals for flagship feature cards. Built from brand palette
// rectangles + mono text fragments — no icons, no gradients, no illustration
// clichés. Each motif reads at 160px square, is purely decorative
// (aria-hidden), and never carries meaning that isn't already in the copy.

import { type Feature } from "../../data/features";

type MotifKind = "chat" | "terminal" | "stack" | "browser";

const MOTIF_BY_ID: Record<string, MotifKind> = {
  "agent-mode": "chat",
  subagents: "chat",
  "code-mode": "terminal",
  "browser-testing": "browser",
  "lovable-cloud": "stack",
  "lovable-ai-gateway": "stack",
  "lovable-mcp-server": "stack",
  "seo-and-ai-search": "browser",
  "custom-domain": "browser",
  "lovable-mobile-app": "terminal",
};

export function hasFlagshipMotif(id: string): boolean {
  return id in MOTIF_BY_ID;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-cream/10 bg-ink/60"
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(251,245,233,0.04), 0 20px 40px -30px rgba(0,0,0,0.6)",
      }}
    >
      {/* faint scanline / grid wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--cream) 1px, transparent 1px), linear-gradient(to bottom, var(--cream) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {children}
    </div>
  );
}

function ChatMotif() {
  return (
    <Frame>
      <div className="absolute inset-0 flex flex-col justify-end gap-2 p-4">
        <div className="flex justify-start">
          <div className="max-w-[70%] rounded-lg rounded-bl-sm border border-cream/10 bg-muted-ink px-2.5 py-1.5 font-mono text-[10px] text-cream/70">
            build the auth flow
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="max-w-[75%] rounded-lg rounded-br-sm px-2.5 py-1.5 font-mono text-[10px] text-cream"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--emerald) 85%, black), var(--emerald))",
              boxShadow: "0 6px 18px -8px color-mix(in oklab, var(--emerald) 60%, transparent)",
            }}
          >
            planning · editing · testing
          </div>
        </div>
        <div className="flex items-center gap-1.5 pl-1 pt-1">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald" />
          <span className="size-1.5 animate-pulse rounded-full bg-emerald/60" style={{ animationDelay: "120ms" }} />
          <span className="size-1.5 animate-pulse rounded-full bg-emerald/40" style={{ animationDelay: "240ms" }} />
        </div>
      </div>
    </Frame>
  );
}

function TerminalMotif() {
  const lines: Array<{ prompt: string; text: string; accent?: boolean }> = [
    { prompt: "$", text: "lovable build" },
    { prompt: ">", text: "resolving · 322 modules", accent: true },
    { prompt: ">", text: "type-checked" },
    { prompt: "✓", text: "shipped in 1.4s", accent: true },
  ];
  return (
    <Frame>
      <div className="absolute inset-0 flex flex-col justify-center gap-1 p-4 font-mono text-[10px] leading-relaxed">
        {lines.map((l, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className={l.accent ? "text-gold" : "text-emerald"}>{l.prompt}</span>
            <span className={l.accent ? "text-cream" : "text-cream/70"}>{l.text}</span>
          </div>
        ))}
        <span className="ml-1 mt-1 inline-block h-3 w-1.5 animate-pulse bg-cream/80" />
      </div>
    </Frame>
  );
}

function StackMotif() {
  const rows = [
    { label: "edge · workers", w: "92%", tint: 0.9 },
    { label: "data · postgres", w: "76%", tint: 0.7 },
    { label: "auth · sessions", w: "60%", tint: 0.5 },
    { label: "storage · assets", w: "44%", tint: 0.35 },
  ];
  return (
    <Frame>
      <div className="absolute inset-0 flex flex-col justify-center gap-2 p-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <div
              className="h-4 rounded-sm border border-cream/10"
              style={{
                width: r.w,
                background: `linear-gradient(90deg, color-mix(in oklab, var(--emerald) ${Math.round(r.tint * 60)}%, transparent), color-mix(in oklab, var(--emerald) ${Math.round(r.tint * 20)}%, transparent))`,
              }}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-cream/45">
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function BrowserMotif() {
  return (
    <Frame>
      <div className="absolute inset-0 flex flex-col p-4">
        {/* URL bar */}
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-cream/25" />
          <span className="size-1.5 rounded-full bg-cream/20" />
          <span className="size-1.5 rounded-full bg-cream/15" />
          <div className="ml-2 flex-1 rounded-sm border border-cream/10 bg-muted-ink px-2 py-1 font-mono text-[9px] text-cream/60">
            https://<span className="text-emerald">yourapp</span>.dev
          </div>
        </div>
        {/* Page content stubs */}
        <div className="mt-3 flex flex-1 flex-col justify-center gap-2">
          <div className="h-2 w-3/4 rounded-sm bg-cream/15" />
          <div className="h-2 w-1/2 rounded-sm bg-cream/10" />
          <div
            className="mt-2 h-6 w-24 rounded-md"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--gold) 60%, transparent), color-mix(in oklab, var(--gold) 20%, transparent))",
              border: "1px solid color-mix(in oklab, var(--gold) 40%, transparent)",
            }}
          />
        </div>
      </div>
    </Frame>
  );
}

export function FlagshipMotif({ feature }: { feature: Feature }) {
  const kind = MOTIF_BY_ID[feature.id];
  if (!kind) return null;
  switch (kind) {
    case "chat":
      return <ChatMotif />;
    case "terminal":
      return <TerminalMotif />;
    case "stack":
      return <StackMotif />;
    case "browser":
      return <BrowserMotif />;
  }
}
