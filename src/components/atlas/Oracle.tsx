// ============================================================================
// Oracle.tsx — "Director's Commentary"
// ---------------------------------------------------------------------------
// The Oracle is the site's single search surface: a command palette (⌘K /
// Ctrl-K, the SEARCH nav item, and the /search route all open it) staged as
// a film-commentary overlay on ivory. Queries run through the same hybrid
// ranker as the MCP search tool — instant client-side over the light card
// dataset, upgraded by the server ranker over full records as it lands.
// Answers are catalog entries, never chat bubbles. Arrow keys move the
// selection, Enter opens it, recent searches persist locally.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Clapperboard, X } from "lucide-react";
import { useFeatures } from "../../hooks/use-features";
import type { FeatureCard } from "../../lib/features.functions";
import { tintForCategory } from "../../lib/category-theme";
import { searchFeaturesFn, type OracleHit } from "../../lib/search.functions";
import { searchFeatures as searchCore } from "../../lib/search-core";
import { consumePendingPaletteOpen, OPEN_PALETTE_EVENT } from "../../lib/palette";

const RECENTS_KEY = "atlas.palette-recents";
const RECENTS_MAX = 5;

const SUGGESTED_QUESTIONS = [
  "What shipped this month?",
  "What's still in Beta?",
  "Does Lovable handle payments?",
];

function readRecents(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string): void {
  try {
    const next = [q, ...readRecents().filter((r) => r !== q)].slice(0, RECENTS_MAX);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

// -------- Instant client-side fallback --------
function fallbackHits(features: FeatureCard[], q: string): OracleHit[] {
  const hits = searchCore(features, q, 20);
  return hits.map((h) => ({
    id: h.feature.id,
    name: h.feature.name,
    category: h.feature.category,
    status: h.feature.status,
    tagline: h.feature.tagline ?? "",
    releaseDate: h.feature.releaseDate,
    matchedField: h.matchedField,
    excerpt: h.excerpt,
    excerptHtml: h.excerptHtml,
    score: h.score,
  }));
}

export function Oracle() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [serverHits, setServerHits] = useState<OracleHit[] | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { features, isLoading: catalogLoading } = useFeatures({ enabled: open });
  const reduce = useReducedMotion();
  const runServerSearch = useServerFn(searchFeaturesFn);
  const navigate = useNavigate();

  const localHits = useMemo(() => (q.trim() ? fallbackHits(features, q) : []), [features, q]);

  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setServerHits(null);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await runServerSearch({ data: { query: trimmed, limit: 20 } });
        if (!cancelled) setServerHits(res.hits);
      } catch {
        // Silent — the local fallback already covers the UI.
      }
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, runServerSearch]);

  const results: OracleHit[] = serverHits ?? localHits;

  // Selection resets when the result set changes.
  useEffect(() => {
    setActiveIdx(results.length > 0 ? 0 : -1);
  }, [q, results.length]);

  // While open: focus the input, remember the trigger to restore focus to,
  // lock body scroll, and flag the modal for other global key handlers.
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setRecents(readRecents());
    document.body.dataset.paletteOpen = "true";
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(t);
      delete document.body.dataset.paletteOpen;
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // ESC closes; ⌘K / Ctrl+K toggles; SEARCH nav + /search open via event.
  // The pending flag covers a direct /search load, where the route's effect
  // fires before this listener has mounted.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (consumePendingPaletteOpen()) setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpenEvent = () => {
      consumePendingPaletteOpen();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    };
  }, [open]);

  // Minimal focus containment — Tab cycles within the overlay.
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const onOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const root = overlayRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ),
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  // Chrome auto-fade in the constellation view.
  const [inConstellation, setInConstellation] = useState(false);
  const [chromeIdle, setChromeIdle] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setInConstellation(document.body.dataset.view === "constellation");
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

  const openHit = useCallback(
    (hit: OracleHit) => {
      const trimmed = q.trim();
      if (trimmed) {
        pushRecent(trimmed);
        setRecents(readRecents());
      }
      close();
      void navigate({ to: "/features/$slug", params: { slug: hit.id } });
    },
    [close, navigate, q],
  );

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(results.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" && activeIdx >= 0 && results[activeIdx]) {
        e.preventDefault();
        openHit(results[activeIdx]);
      }
    },
    [activeIdx, openHit, results],
  );

  return (
    <>
      {/* Film-slate button — the commentary track is always one tap away. */}
      <button
        type="button"
        aria-label="Open the Oracle — search the catalog"
        onClick={() => setOpen(true)}
        className="group fixed bottom-5 right-5 z-[80] grid size-12 place-items-center rounded-full border border-gold-deep/60 bg-muted-ink text-gold shadow-[0_0_28px_-8px_rgba(201,162,39,0.9)] transition-all duration-500 hover:scale-105 hover:border-gold-deep hover:shadow-[0_0_36px_-6px_rgba(201,162,39,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:bottom-8 sm:right-8"
        style={{
          opacity: chromeIdle && !open ? 0.15 : 1,
        }}
      >
        <Clapperboard className="size-5" aria-hidden />
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-full border border-line bg-muted-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Oracle
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="oracle-overlay"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search the catalog — Director's Commentary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex flex-col items-center overflow-y-auto bg-ink/[0.97] px-5 py-16 backdrop-blur-xl sm:px-10 sm:py-20"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            onKeyDown={onOverlayKeyDown}
          >
            {/* Constellation-sky backdrop — the same gilded universe. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage: "url(/art/constellation-sky-1600.webp)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Close */}
            <button
              type="button"
              onClick={close}
              aria-label="Close Oracle"
              className="absolute right-5 top-5 z-10 grid size-10 place-items-center rounded-full border border-line bg-muted-ink text-cream/70 transition-colors hover:border-gold-deep hover:text-gold sm:right-8 sm:top-8"
            >
              <X className="size-4" aria-hidden />
            </button>

            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.08, duration: reduce ? 0.01 : 0.4 }}
              className="relative mb-3 font-mono text-[11px] uppercase tracking-[0.32em] text-gold"
            >
              Director&rsquo;s Commentary
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.12, duration: reduce ? 0.01 : 0.5 }}
              className="relative mb-8 max-w-3xl text-center font-display text-3xl font-medium tracking-tight text-cream sm:text-5xl"
            >
              Ask the Oracle.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.18, duration: reduce ? 0.01 : 0.5 }}
              className="relative w-full max-w-2xl"
            >
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="does lovable handle payments?"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search the catalog"
                className="w-full border-0 border-b border-gold-deep/50 bg-transparent px-1 py-4 text-center text-xl text-cream placeholder:text-cream/40 focus:border-gold-deep focus:outline-none sm:text-2xl [&::-webkit-search-cancel-button]:hidden"
              />
              <p aria-live="polite" className="sr-only">
                {q.trim().length === 0
                  ? "Type to search the catalog."
                  : `${results.length} matching features. Use the arrow keys to choose, Enter to open.`}
              </p>
            </motion.div>

            {/* Suggested questions + recents — shown while the reel is empty. */}
            {q.trim().length === 0 && (
              <div className="relative mt-8 flex w-full max-w-2xl flex-col items-center gap-5">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQ(s)}
                      className="rounded-full border border-line bg-muted-ink px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-cream/75 transition-colors hover:border-gold-deep hover:text-gold"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {recents.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-cream/55">
                      Recent
                    </span>
                    {recents.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setQ(r)}
                        className="rounded-full border border-transparent px-2.5 py-1 font-mono text-[11px] text-cream/65 underline-offset-4 transition-colors hover:text-gold hover:underline"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Results — catalog entries as ivory index cards. */}
            <div id="oracle-results" className="relative mt-10 w-full max-w-4xl">
              {q.trim().length === 0 ? (
                <p className="text-center font-mono text-[11px] uppercase tracking-[0.24em] text-cream/55">
                  Type a question. The atlas answers in features.
                </p>
              ) : catalogLoading && serverHits === null && results.length === 0 ? (
                <p className="text-center font-mono text-[11px] uppercase tracking-[0.24em] text-cream/60">
                  Loading the atlas…
                </p>
              ) : results.length === 0 ? (
                <p className="text-center font-mono text-[11px] uppercase tracking-[0.24em] text-cream/60">
                  No matching stars. Try a broader term.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {results.map((f: OracleHit, i: number) => {
                    const tint = tintForCategory(f.category);
                    const isActive = i === activeIdx;
                    const showExcerpt =
                      f.matchedField !== "title" && f.excerptHtml && f.excerpt !== f.name;
                    return (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: reduce ? 0 : Math.min(0.05 * i, 0.3),
                          duration: reduce ? 0.01 : 0.32,
                        }}
                      >
                        <Link
                          to="/features/$slug"
                          params={{ slug: f.id }}
                          id={`oracle-hit-${f.id}`}
                          aria-current={isActive ? "true" : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            openHit(f);
                          }}
                          onPointerEnter={() => setActiveIdx(i)}
                          className={
                            "card-cine group block p-4 " +
                            (isActive ? "border-gold-deep shadow-[0_8px_32px_rgba(201,162,39,0.14)]" : "")
                          }
                          style={{
                            backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${tint} 7%, transparent) 0%, transparent 60%)`,
                          }}
                        >
                          <p
                            className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: tint }}
                          >
                            {f.category} · {f.status === "Removed" ? "Retired" : f.status}
                          </p>
                          <p className="mt-1 font-display text-base font-medium text-cream group-hover:text-gold">
                            {f.name}
                          </p>
                          {showExcerpt ? (
                            <p
                              className="oracle-excerpt mt-1 line-clamp-2 text-sm text-cream/75"
                              dangerouslySetInnerHTML={{ __html: f.excerptHtml }}
                            />
                          ) : (
                            f.tagline && (
                              <p className="mt-1 line-clamp-2 text-sm text-cream/75">{f.tagline}</p>
                            )
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="relative mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/55">
              ↑↓ to choose · Enter to open · ESC to close · ⌘K to reopen
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
