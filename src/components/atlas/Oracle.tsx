// ============================================================================
// Oracle.tsx
// ---------------------------------------------------------------------------
// The Oracle replaces any generic chat widget. A small glowing constellation-
// node button lives bottom-right. On click it opens a full-screen editorial
// overlay ("Ask the atlas") with a single input. The query fuzzy-matches
// the features catalog client-side (identical scoring to the Atlas search
// bar and MCP search tool) and answers *in-universe*: results are gold-foil
// mini-cards that the visitor can dive into or open directly.
// No message bubbles. No avatar face. No greetings.
// The button auto-fades after 3s idle when the constellation view is open
// (respected via document.body[data-view="constellation"]); everywhere else
// it stays quietly visible.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useFeatures } from "../../hooks/use-features";
import type { FeatureCard } from "../../lib/features.functions";
import { tintForCategory } from "../../lib/category-theme";

// -------- Scoring: mirrors the on-page search bar. --------
// Weighting: exact name match > name substring > tagline substring > category.
// Kept intentionally simple; a Lovable AI synthesis is optional and disabled
// by default to keep the Oracle instantaneous and offline-safe.
function scoreFeature(f: FeatureCard, q: string): number {
  const t = q.trim().toLowerCase();
  if (!t) return 0;
  const name = f.name.toLowerCase();
  const tag = (f.tagline ?? "").toLowerCase();
  const cat = (f.category ?? "").toLowerCase();
  let s = 0;
  if (name === t) s += 200;
  if (name.startsWith(t)) s += 90;
  if (name.includes(t)) s += 60;
  if (tag.includes(t)) s += 25;
  if (cat.includes(t)) s += 12;
  // Multi-word: bonus if every token appears somewhere.
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const hay = `${name} ${tag} ${cat}`;
    const hits = tokens.filter((w) => hay.includes(w)).length;
    s += (hits / tokens.length) * 30;
  }
  return s;
}

function askAtlas(features: FeatureCard[], q: string): FeatureCard[] {
  const scored = features
    .map((f) => ({ f, s: scoreFeature(f, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map((x) => x.f);
  return scored;
}

export function Oracle() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { features } = useFeatures();
  const reduce = useReducedMotion();

  const results = useMemo(() => askAtlas(features, q), [features, q]);

  // Focus the input the moment the overlay mounts.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  // ESC closes; ⌘K / Ctrl+K opens.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Chrome auto-fade in the constellation view. We watch the body dataset
  // for `data-view="constellation"` and idle-fade the button after 3s of
  // pointer stillness. Everywhere else the button stays fully visible.
  const [inConstellation, setInConstellation] = useState(false);
  const [chromeIdle, setChromeIdle] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () =>
      setInConstellation(document.body.dataset.view === "constellation");
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { attributes: true, attributeFilter: ["data-view"] });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    if (!inConstellation) {
      setChromeIdle(false);
      return;
    }
    let idleT: ReturnType<typeof setTimeout> | null = null;
    const kick = () => {
      setChromeIdle(false);
      if (idleT) clearTimeout(idleT);
      idleT = setTimeout(() => setChromeIdle(true), 3000);
    };
    kick();
    window.addEventListener("pointermove", kick, { passive: true });
    window.addEventListener("pointerdown", kick, { passive: true });
    window.addEventListener("keydown", kick);
    return () => {
      window.removeEventListener("pointermove", kick);
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      if (idleT) clearTimeout(idleT);
    };
  }, [inConstellation]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* Constellation-node button — glows like a distant star. */}
      <button
        type="button"
        aria-label="Ask the Oracle"
        onClick={() => setOpen(true)}
        className="group fixed bottom-5 right-5 z-[80] grid size-12 place-items-center rounded-full border border-gold/40 bg-ink/70 text-gold shadow-[0_0_28px_-8px_rgba(201,169,97,0.9)] backdrop-blur-md transition-all duration-500 hover:scale-105 hover:border-gold hover:shadow-[0_0_36px_-6px_rgba(201,169,97,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:bottom-8 sm:right-8"
        style={{
          opacity: chromeIdle && !open ? 0.15 : 1,
        }}
      >
        <Sparkles className="size-5" aria-hidden />
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-full border border-cream/10 bg-ink/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/70 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          Oracle
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="oracle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex flex-col items-center overflow-y-auto bg-ink/95 px-5 py-16 backdrop-blur-xl sm:px-10 sm:py-20"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            {/* Star-map backdrop — a wash of gold points so the overlay
                feels like part of the same universe as the constellation. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(1px 1px at 20% 30%, rgba(201,169,97,0.6) 50%, transparent 51%), radial-gradient(1px 1px at 70% 60%, rgba(31,122,90,0.5) 50%, transparent 51%), radial-gradient(1px 1px at 85% 20%, rgba(201,169,97,0.5) 50%, transparent 51%), radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.4) 50%, transparent 51%)",
                backgroundSize: "600px 600px, 500px 500px, 700px 700px, 550px 550px",
              }}
            />

            {/* Close */}
            <button
              type="button"
              onClick={close}
              aria-label="Close Oracle"
              className="absolute right-5 top-5 z-10 grid size-10 place-items-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-gold/60 hover:text-gold sm:right-8 sm:top-8"
            >
              <X className="size-4" aria-hidden />
            </button>

            {/* Overline */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.08, duration: 0.4 }}
              className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] text-gold/80"
            >
              The Oracle
            </motion.p>

            {/* Prompt */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.12, duration: 0.5 }}
              className="mb-8 max-w-3xl text-center text-3xl font-medium tracking-tight text-cream sm:text-5xl"
            >
              Ask the atlas.
            </motion.h2>

            {/* Input — no chrome, an underscore of gold. */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.18, duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="does lovable handle payments?"
                autoComplete="off"
                spellCheck={false}
                className="w-full border-0 border-b border-gold/40 bg-transparent px-1 py-4 text-center text-xl text-cream placeholder:text-cream/25 focus:border-gold focus:outline-none sm:text-2xl"
              />
            </motion.div>

            {/* Results — gold-foil mini-cards. */}
            <div className="mt-10 w-full max-w-4xl">
              {q.trim().length === 0 ? (
                <p className="text-center font-mono text-[11px] uppercase tracking-[0.24em] text-cream/40">
                  Type a question. The atlas answers in features.
                </p>
              ) : results.length === 0 ? (
                <p className="text-center font-mono text-[11px] uppercase tracking-[0.24em] text-cream/50">
                  No matching stars. Try a broader term.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {results.map((f, i) => {
                    const tint = tintForCategory(f.category);
                    return (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: reduce ? 0 : Math.min(0.05 * i, 0.3),
                          duration: 0.32,
                        }}
                      >
                        <Link
                          to="/features/$slug"
                          params={{ slug: f.id }}
                          onClick={close}
                          className="group block rounded-lg border border-gold/25 bg-gradient-to-br from-[#1a1409]/70 to-[#0A0A0A]/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-[0_10px_30px_-12px_rgba(201,169,97,0.6)]"
                          style={{
                            backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${tint} 8%, transparent) 0%, transparent 60%)`,
                          }}
                        >
                          <p
                            className="font-mono text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: tint }}
                          >
                            {f.category} · {f.status}
                          </p>
                          <p className="mt-1 text-base font-medium text-cream group-hover:text-gold">
                            {f.name}
                          </p>
                          {f.tagline && (
                            <p className="mt-1 line-clamp-2 text-sm text-cream/60">
                              {f.tagline}
                            </p>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/30">
              ESC to close · ⌘K to reopen
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
