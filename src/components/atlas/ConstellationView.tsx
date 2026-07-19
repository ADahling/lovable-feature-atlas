import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import { useFeatures } from "../../hooks/use-features";
import { accentForCategory } from "../../lib/category-theme";
import type { CatalogCardsResult, FeatureCard } from "../../lib/features.functions";

const VIEW_WIDTH = 1600;
const VIEW_HEIGHT = 1120;
const DAY_MS = 86_400_000;
const RECENT_DAYS = 30;
const NEWBORN_DAYS = 7;
const MIN_SCALE = 0.65;
const MAX_SCALE = 3.2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

interface Point {
  x: number;
  y: number;
}

interface PaperStar extends Point {
  feature: FeatureCard;
  color: string;
  radius: number;
  isRecent: boolean;
  isNewborn: boolean;
  ageDays: number;
}

interface PaperEdge {
  from: Point;
  to: Point;
}

interface PaperCluster {
  category: string;
  color: string;
  anchor: Point;
  radius: number;
  stars: PaperStar[];
  edges: PaperEdge[];
}

interface PaperLayout {
  clusters: PaperCluster[];
  stars: PaperStar[];
}

interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

interface PanSession {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  moved: boolean;
}

const INITIAL_VIEW: ViewportTransform = { x: 0, y: 0, scale: 1 };

function hashId(id: string): number {
  let hash = 2166136261 >>> 0;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function releaseAgeDays(releaseDate: string | null | undefined, now: number) {
  if (!releaseDate) return Number.POSITIVE_INFINITY;
  const timestamp = Date.parse(releaseDate);
  if (!Number.isFinite(timestamp)) return Number.POSITIVE_INFINITY;
  return (now - timestamp) / DAY_MS;
}

function buildPaperLayout(features: FeatureCard[]): PaperLayout {
  const categories = Array.from(new Set(features.map((feature) => feature.category))).sort((a, b) =>
    a.localeCompare(b),
  );

  if (categories.length === 0) {
    return { clusters: [], stars: [] };
  }

  // Bucket to UTC day so SSR + client hydrate identically (Date.now() drifts between the two).
  const now = Math.floor(Date.now() / 86_400_000) * 86_400_000;
  const columns = Math.min(5, Math.max(1, Math.ceil(Math.sqrt(categories.length * 1.4))));
  const rows = Math.ceil(categories.length / columns);
  const spacingX = columns === 1 ? 0 : (VIEW_WIDTH - 300) / (columns - 1);
  const spacingY = rows === 1 ? 0 : (VIEW_HEIGHT - 280) / (rows - 1);
  const clusters: PaperCluster[] = [];

  categories.forEach((category, categoryIndex) => {
    const row = Math.floor(categoryIndex / columns);
    const column = categoryIndex % columns;
    const rowCount = Math.min(columns, categories.length - row * columns);
    const rowOffset = ((columns - rowCount) * spacingX) / 2;
    const anchor = {
      x: 150 + rowOffset + column * spacingX,
      y: 145 + row * spacingY,
    };
    const color = accentForCategory(category, "light");
    const categoryFeatures = features
      .filter((feature) => feature.category === category)
      .sort((a, b) => {
        const aAge = releaseAgeDays(a.releaseDate, now);
        const bAge = releaseAgeDays(b.releaseDate, now);
        return aAge - bAge || a.name.localeCompare(b.name);
      });
    const clusterRadius = Math.min(116, Math.max(68, 34 + Math.sqrt(categoryFeatures.length) * 10));
    const phase = (hashId(category) % 628) / 100;

    const stars = categoryFeatures.map((feature, featureIndex) => {
      const random = mulberry32(hashId(feature.id));
      const radialStep =
        (clusterRadius - 18) / Math.max(1, Math.sqrt(Math.max(1, categoryFeatures.length - 1)));
      const distance = featureIndex === 0 ? 0 : 14 + Math.sqrt(featureIndex) * radialStep;
      const angle = phase + featureIndex * GOLDEN_ANGLE;
      const ageDays = releaseAgeDays(feature.releaseDate, now);
      const isRecent = ageDays >= 0 && ageDays <= RECENT_DAYS;
      const isNewborn = ageDays >= 0 && ageDays <= NEWBORN_DAYS;
      const jitterX = (random() - 0.5) * 7;
      const jitterY = (random() - 0.5) * 7;

      return {
        feature,
        color,
        x: anchor.x + Math.cos(angle) * distance + jitterX,
        y: anchor.y + Math.sin(angle) * distance * 0.78 + jitterY,
        radius: isNewborn ? 10 : isRecent ? 8.5 : feature.status === "Beta" ? 7.5 : 6.5,
        isRecent,
        isNewborn,
        ageDays,
      };
    });

    const edges: PaperEdge[] = [];
    stars.forEach((star, index) => {
      if (index === 0) return;
      let nearest = stars[0];
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (let prior = 0; prior < index; prior += 1) {
        const candidate = stars[prior];
        const dx = star.x - candidate.x;
        const dy = star.y - candidate.y;
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearest = candidate;
          nearestDistance = distance;
        }
      }
      edges.push({ from: nearest, to: star });
    });

    clusters.push({
      category,
      color,
      anchor,
      radius: clusterRadius,
      stars,
      edges,
    });
  });

  return {
    clusters,
    stars: clusters.flatMap((cluster) => cluster.stars),
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function starDomId(featureId: string) {
  return "paper-star-" + featureId;
}

function formatReleaseDate(releaseDate: string | null | undefined) {
  if (!releaseDate) return null;
  const date = new Date(releaseDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ConstellationView({ initialData }: { initialData: CatalogCardsResult }) {
  const { features } = useFeatures({
    initialData,
    initialDataComplete: true,
  });
  const reduceMotion = usePrefersReducedMotion();
  const layout = useMemo(() => buildPaperLayout(features), [features]);
  const starById = useMemo(
    () => new Map(layout.stars.map((star) => [star.feature.id, star])),
    [layout.stars],
  );
  const [viewport, setViewport] = useState<ViewportTransform>(INITIAL_VIEW);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const panSession = useRef<PanSession | null>(null);
  const selected = selectedId ? (starById.get(selectedId) ?? null) : null;
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const interactiveStars = useMemo(
    () =>
      layout.stars.filter((star) => {
        if (activeCategory && star.feature.category !== activeCategory) {
          return false;
        }
        if (!normalizedQuery) return true;
        const searchable = [
          star.feature.name,
          star.feature.category,
          star.feature.status,
          star.feature.tagline,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        return searchable.includes(normalizedQuery);
      }),
    [activeCategory, layout.stars, normalizedQuery],
  );

  const interactiveIds = useMemo(
    () => new Set(interactiveStars.map((star) => star.feature.id)),
    [interactiveStars],
  );

  useEffect(() => {
    if (interactiveStars.length === 0) {
      setFocusId(null);
      return;
    }
    if (!focusId || !interactiveIds.has(focusId)) {
      setFocusId(interactiveStars[0].feature.id);
    }
  }, [focusId, interactiveIds, interactiveStars]);

  const focusStarElement = useCallback((featureId: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(starDomId(featureId))?.focus();
    });
  }, []);

  const previewStar = useCallback(
    (star: PaperStar, moveFocus = false) => {
      setSelectedId(star.feature.id);
      setFocusId(star.feature.id);
      if (moveFocus) focusStarElement(star.feature.id);
    },
    [focusStarElement],
  );

  const closePreview = useCallback(
    (restoreFocus = false) => {
      setSelectedId(null);
      if (restoreFocus && focusId) focusStarElement(focusId);
    },
    [focusId, focusStarElement],
  );

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePreview(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closePreview, selectedId]);

  const zoomAt = useCallback((factor: number, point?: Point) => {
    setViewport((current) => {
      const center = point ?? { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 };
      const nextScale = clamp(current.scale * factor, MIN_SCALE, MAX_SCALE);
      const ratio = nextScale / current.scale;
      return {
        scale: nextScale,
        x: center.x - (center.x - current.x) * ratio,
        y: center.y - (center.y - current.y) * ratio,
      };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewport(INITIAL_VIEW);
  }, []);

  const focusCategory = useCallback((cluster: PaperCluster) => {
    const scale = 2;
    setViewport({
      scale,
      x: VIEW_WIDTH / 2 - cluster.anchor.x * scale,
      y: VIEW_HEIGHT / 2 - cluster.anchor.y * scale,
    });
  }, []);

  const handleCategory = (cluster: PaperCluster) => {
    const isCurrent = activeCategory === cluster.category;
    setQuery("");
    setSelectedId(null);
    setActiveCategory(isCurrent ? null : cluster.category);
    if (isCurrent) resetView();
    else focusCategory(cluster);
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const point = {
      x: ((event.clientX - bounds.left) / bounds.width) * VIEW_WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * VIEW_HEIGHT,
    };
    zoomAt(event.deltaY < 0 ? 1.12 : 0.89, point);
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    const target = event.target as SVGElement;
    if (target.closest("[data-paper-star]")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    panSession.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: viewport.x,
      startY: viewport.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const session = panSession.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - session.startClientX) / bounds.width) * VIEW_WIDTH;
    const dy = ((event.clientY - session.startClientY) / bounds.height) * VIEW_HEIGHT;
    if (Math.abs(dx) + Math.abs(dy) > 4) session.moved = true;
    setViewport((current) => ({
      ...current,
      x: session.startX + dx,
      y: session.startY + dy,
    }));
  };

  const finishPan = (event: ReactPointerEvent<SVGSVGElement>) => {
    const session = panSession.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!session.moved) closePreview(false);
    panSession.current = null;
    setIsDragging(false);
  };

  const handleStarKeyDown = (event: ReactKeyboardEvent<SVGGElement>, star: PaperStar) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      previewStar(star);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closePreview(false);
      return;
    }

    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;

    event.preventDefault();
    const currentIndex = Math.max(
      0,
      interactiveStars.findIndex((candidate) => candidate.feature.id === star.feature.id),
    );
    const targetIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? interactiveStars.length - 1
          : (currentIndex + direction + interactiveStars.length) % interactiveStars.length;
    const target = interactiveStars[targetIndex];
    if (target) previewStar(target, true);
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const firstMatch = interactiveStars[0];
    if (!firstMatch) return;
    event.preventDefault();
    setActiveCategory(null);
    previewStar(firstMatch, true);
  };

  const visibleCount = interactiveStars.length;
  const currentScale = Math.round(viewport.scale * 100);

  return (
    <div
      data-atlas-constellation
      className="flex h-[100dvh] flex-col overflow-hidden bg-[#f7f1e7] text-[#173f36]"
    >
      <header className="relative z-20 shrink-0 border-b border-[#d8cdbd] bg-[#fbf7ef]/95 px-4 py-4 shadow-[0_8px_30px_rgba(73,60,42,0.05)] backdrop-blur-sm sm:px-7 sm:py-5">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
              <Link
                to="/"
                className="mt-1 inline-flex min-h-11 shrink-0 items-center rounded-full border border-[#c9bda9] bg-white px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#315e53] transition-colors hover:border-[#315e53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/40"
              >
                Back to grid
              </Link>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#6b5a40]">
                  Paper cosmos
                </p>
                <h1 className="mt-1 font-display text-3xl font-semibold leading-none tracking-[-0.03em] text-[#173f36] sm:text-4xl">
                  The constellation
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6c6256]">
                  Every feature is a star. Every color is a category.
                </p>
              </div>
            </div>

            <div className="w-full sm:max-w-md">
              <label
                htmlFor="constellation-search"
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#786b5a]"
              >
                Find a star
              </label>
              <div className="mt-1.5 flex items-center rounded-full border border-[#c9bda9] bg-white px-4 shadow-sm focus-within:border-[#315e53] focus-within:ring-2 focus-within:ring-[#315e53]/15">
                <input
                  id="constellation-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search feature or category"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#173f36] outline-none placeholder:text-[#9b9183]"
                />
                <span
                  className="ml-3 shrink-0 font-mono text-[10px] text-[#7d7162]"
                  aria-live="polite"
                >
                  {visibleCount}/{features.length}
                </span>
              </div>
            </div>
          </div>

          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-1 sm:px-1"
            aria-label="Filter and focus by category"
          >
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setQuery("");
                setSelectedId(null);
                resetView();
              }}
              aria-pressed={activeCategory === null}
              className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[#b9ab96] bg-white px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#315e53] transition-colors hover:border-[#315e53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/35"
            >
              All clusters
            </button>
            {layout.clusters.map((cluster) => {
              const active = activeCategory === cluster.category;
              return (
                <button
                  key={cluster.category}
                  type="button"
                  onClick={() => handleCategory(cluster)}
                  aria-pressed={active}
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-[border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/35"
                  style={{
                    borderColor: active ? cluster.color : "#cfc3b2",
                    color: cluster.color,
                    boxShadow: active ? "inset 0 0 0 1px " + cluster.color : "none",
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cluster.color }}
                    aria-hidden
                  />
                  {cluster.category}
                  <span className="text-[#5a5140]">{cluster.stars.length}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <p id="constellation-instructions" className="sr-only">
          Drag the map to pan and use the wheel or zoom controls to zoom. Tab into the map, then use
          arrow keys to move between stars. Press Enter or Space to preview a feature and Escape to
          close the preview.
        </p>

        <svg
          data-atlas-constellation-map
          viewBox={"0 0 " + VIEW_WIDTH + " " + VIEW_HEIGHT}
          role="group"
          aria-label="Interactive map of Lovable feature clusters"
          aria-describedby="constellation-instructions"
          className={
            "h-full w-full select-none " + (isDragging ? "cursor-grabbing" : "cursor-grab")
          }
          style={{ touchAction: "none" }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPan}
          onPointerCancel={finishPan}
        >
          <defs>
            <pattern id="paper-cosmos-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#8f816d"
                strokeWidth="0.7"
                opacity="0.12"
              />
              <circle cx="24" cy="24" r="1.1" fill="#8f816d" opacity="0.18" />
            </pattern>
            <filter id="paper-star-shadow" x="-80%" y="-80%" width="260%" height="260%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="2.5"
                floodColor="#796b58"
                floodOpacity="0.2"
              />
            </filter>
          </defs>

          <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="#f7f1e7" />
          <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#paper-cosmos-grid)" />
          <path
            d="M70 780 C330 530 490 100 860 210 C1200 310 1210 830 1535 910"
            fill="none"
            stroke="#b7aa97"
            strokeWidth="1.6"
            strokeDasharray="8 14"
            opacity="0.28"
          />
          <path
            d="M120 260 C430 430 600 960 1030 840 C1320 760 1300 340 1510 190"
            fill="none"
            stroke="#cfbd9f"
            strokeWidth="1"
            strokeDasharray="2 15"
            opacity="0.32"
          />

          <g
            transform={
              "translate(" + viewport.x + " " + viewport.y + ") scale(" + viewport.scale + ")"
            }
            style={{
              transition:
                reduceMotion || isDragging
                  ? "none"
                  : "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {layout.clusters.map((cluster) => {
              const categoryDimmed = activeCategory !== null && activeCategory !== cluster.category;
              const clusterHasMatch = cluster.stars.some((star) =>
                interactiveIds.has(star.feature.id),
              );
              const clusterOpacity = categoryDimmed
                ? 0.09
                : normalizedQuery && !clusterHasMatch
                  ? 0.12
                  : 1;

              return (
                <g
                  key={cluster.category}
                  opacity={clusterOpacity}
                  style={{
                    transition: reduceMotion ? "none" : "opacity 180ms ease-out",
                    pointerEvents: categoryDimmed ? "none" : "auto",
                  }}
                >
                  <ellipse
                    cx={cluster.anchor.x}
                    cy={cluster.anchor.y}
                    rx={cluster.radius + 22}
                    ry={(cluster.radius + 22) * 0.79}
                    fill={cluster.color}
                    fillOpacity="0.055"
                    stroke={cluster.color}
                    strokeOpacity="0.2"
                    strokeWidth="1.25"
                    strokeDasharray="4 9"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                  />
                  <text
                    x={cluster.anchor.x}
                    y={cluster.anchor.y - cluster.radius * 0.79 - 28}
                    textAnchor="middle"
                    fill={cluster.color}
                    fontSize="13"
                    fontWeight="700"
                    letterSpacing="2.4"
                    className="font-mono"
                    paintOrder="stroke"
                    stroke="#f7f1e7"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    pointerEvents="none"
                  >
                    {cluster.category.toLocaleUpperCase()}
                  </text>
                  <text
                    x={cluster.anchor.x}
                    y={cluster.anchor.y - cluster.radius * 0.79 - 10}
                    textAnchor="middle"
                    fill="#857866"
                    fontSize="10"
                    letterSpacing="1.5"
                    className="font-mono"
                    paintOrder="stroke"
                    stroke="#f7f1e7"
                    strokeWidth="4"
                    pointerEvents="none"
                  >
                    {cluster.stars.length + " FEATURES"}
                  </text>

                  {cluster.edges.map((edge, index) => (
                    <line
                      key={cluster.category + "-edge-" + index}
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      stroke={cluster.color}
                      strokeWidth="1.15"
                      strokeOpacity="0.28"
                      vectorEffect="non-scaling-stroke"
                      pointerEvents="none"
                    />
                  ))}

                  {cluster.stars.map((star) => {
                    const id = star.feature.id;
                    const isInteractive = interactiveIds.has(id);
                    const isSelected = selectedId === id;
                    const isHovered = hoveredId === id;
                    const isFocused = focusId === id;
                    const starOpacity = normalizedQuery && !isInteractive ? 0.08 : 1;
                    const releaseLabel = star.isNewborn
                      ? "new this week"
                      : star.isRecent
                        ? "shipped in the last 30 days"
                        : "";
                    const accessibleLabel = [
                      star.feature.name,
                      star.feature.category,
                      star.feature.status,
                      releaseLabel,
                      "Press Enter to preview",
                    ]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <g
                        key={id}
                        id={starDomId(id)}
                        data-paper-star
                        role="button"
                        tabIndex={isInteractive && isFocused ? 0 : -1}
                        aria-label={accessibleLabel}
                        aria-pressed={isSelected}
                        aria-haspopup="dialog"
                        opacity={starOpacity}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => previewStar(star)}
                        onPointerEnter={() => setHoveredId(id)}
                        onPointerLeave={() => setHoveredId(null)}
                        onFocus={() => previewStar(star)}
                        onKeyDown={(event) => handleStarKeyDown(event, star)}
                        style={{
                          cursor: isInteractive ? "pointer" : "default",
                          outline: "none",
                          pointerEvents: isInteractive ? "auto" : "none",
                          transition: reduceMotion ? "none" : "opacity 160ms ease-out",
                        }}
                      >
                        <title>
                          {star.feature.name +
                            " · " +
                            star.feature.category +
                            " · " +
                            star.feature.status}
                        </title>
                        <circle
                          cx={star.x}
                          cy={star.y}
                          r="24"
                          fill="transparent"
                          pointerEvents="all"
                        />
                        {star.isRecent && (
                          <circle
                            cx={star.x}
                            cy={star.y}
                            r={star.radius + 8}
                            fill={star.color}
                            fillOpacity={star.isNewborn ? 0.14 : 0.09}
                            stroke={star.color}
                            strokeOpacity={star.isNewborn ? 0.42 : 0.27}
                            strokeWidth="1.2"
                            vectorEffect="non-scaling-stroke"
                            pointerEvents="none"
                          >
                            {star.isNewborn && !reduceMotion && (
                              <animate
                                attributeName="r"
                                values={
                                  star.radius +
                                  7 +
                                  ";" +
                                  (star.radius + 13) +
                                  ";" +
                                  (star.radius + 7)
                                }
                                dur="2.8s"
                                repeatCount="indefinite"
                              />
                            )}
                          </circle>
                        )}
                        {star.feature.status === "Beta" && (
                          <circle
                            cx={star.x}
                            cy={star.y}
                            r={star.radius + 3.5}
                            fill="none"
                            stroke={star.color}
                            strokeWidth="1.2"
                            strokeDasharray="2.4 2.4"
                            strokeOpacity="0.7"
                            vectorEffect="non-scaling-stroke"
                            pointerEvents="none"
                          />
                        )}
                        <circle
                          cx={star.x}
                          cy={star.y}
                          r={star.radius}
                          fill={star.color}
                          stroke="#fffdf8"
                          strokeWidth={star.isRecent ? 2.6 : 1.8}
                          vectorEffect="non-scaling-stroke"
                          filter="url(#paper-star-shadow)"
                          pointerEvents="none"
                        />
                        <circle
                          cx={star.x - star.radius * 0.25}
                          cy={star.y - star.radius * 0.25}
                          r={Math.max(1.5, star.radius * 0.23)}
                          fill="#fffdf8"
                          fillOpacity="0.82"
                          pointerEvents="none"
                        />
                        {(isSelected || isFocused) && (
                          <circle
                            cx={star.x}
                            cy={star.y}
                            r={star.radius + 7}
                            fill="none"
                            stroke="#173f36"
                            strokeWidth="2.3"
                            vectorEffect="non-scaling-stroke"
                            pointerEvents="none"
                          />
                        )}
                        {(isHovered || isSelected) && (
                          <text
                            x={star.x + star.radius + 8}
                            y={star.y - star.radius - 7}
                            fill="#173f36"
                            fontSize="12"
                            fontWeight="700"
                            className="font-mono"
                            paintOrder="stroke"
                            stroke="#fffdf8"
                            strokeWidth="5"
                            strokeLinejoin="round"
                            pointerEvents="none"
                          >
                            {star.feature.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>

        <div
          data-constellation-controls
          className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-[#c9bda9] bg-[#fffdf8]/94 p-1.5 shadow-[0_8px_24px_rgba(73,60,42,0.12)] backdrop-blur sm:left-5 sm:top-5"
        >
          <button
            type="button"
            onClick={() => zoomAt(1.22)}
            aria-label="Zoom in"
            className="grid size-10 place-items-center rounded-full text-lg text-[#315e53] transition-colors hover:bg-[#eee5d7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/35"
          >
            +
          </button>
          <span
            className="min-w-12 text-center font-mono text-[10px] text-[#776b5c]"
            aria-live="polite"
          >
            {currentScale}%
          </span>
          <button
            type="button"
            onClick={() => zoomAt(0.82)}
            aria-label="Zoom out"
            className="grid size-10 place-items-center rounded-full text-lg text-[#315e53] transition-colors hover:bg-[#eee5d7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/35"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            className="min-h-10 rounded-full px-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#315e53] transition-colors hover:bg-[#eee5d7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/35"
          >
            Reset
          </button>
        </div>

        <div
          data-constellation-legend
          className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] rounded-2xl border border-[#d3c7b6] bg-[#fffdf8]/92 px-3 py-2 shadow-sm backdrop-blur sm:bottom-5 sm:left-5 sm:max-w-none sm:px-4 sm:py-3"
        >
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#6f6558] sm:text-[10px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#315e53]" aria-hidden />
              Feature
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full border-2 border-[#9a6c20]" aria-hidden />
              New in 30 days
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full border border-dashed border-[#315e53]"
                aria-hidden
              />
              Beta
            </span>
          </div>
          <p className="mt-1.5 hidden text-[11px] text-[#766b5d] sm:block">
            Drag to pan · scroll to zoom · click or keyboard-focus a star
          </p>
          <p className="mt-1.5 text-[11px] text-[#766b5d] sm:hidden">
            Choose a category, then drag and tap to explore
          </p>
        </div>

        {features.length === 0 && (
          <div className="absolute inset-0 grid place-items-center p-6">
            <div className="rounded-3xl border border-[#d4c8b8] bg-[#fffdf8] p-7 text-center shadow-lg">
              <p className="font-display text-2xl text-[#173f36]">
                The map is waiting for its stars.
              </p>
              <p className="mt-2 text-sm text-[#6f6558]">Feature data could not be loaded.</p>
            </div>
          </div>
        )}

        {selected && (
          <aside
            id="constellation-preview"
            role="dialog"
            aria-modal="false"
            aria-label={selected.feature.name + " preview"}
            className="absolute inset-x-3 bottom-3 z-30 max-h-[70%] overflow-y-auto rounded-[28px] border bg-[#fffdf8]/98 p-5 shadow-[0_24px_70px_rgba(57,47,34,0.24)] backdrop-blur-xl sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:max-h-[calc(100%-2.5rem)] sm:w-[370px] sm:p-6"
            style={{ borderColor: selected.color }}
          >
            <button
              type="button"
              onClick={() => closePreview(true)}
              aria-label="Close preview"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-[#d4c8b8] bg-white text-xl leading-none text-[#315e53] transition-colors hover:border-[#315e53] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/35"
            >
              ×
            </button>

            <div className="pr-12">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: selected.color }}
              >
                {selected.feature.category}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em]"
                  style={{
                    borderColor: selected.color,
                    color: selected.color,
                  }}
                >
                  {selected.feature.status}
                </span>
                {selected.isRecent && (
                  <span className="rounded-full bg-[#efe4cf] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-[#815b1f]">
                    {selected.isNewborn ? "New this week" : "New release"}
                  </span>
                )}
              </div>
            </div>

            <h2 className="mt-5 max-w-[12ch] font-display text-[32px] font-semibold leading-[1.03] tracking-[-0.03em] text-[#173f36]">
              {selected.feature.name}
            </h2>

            {selected.feature.tagline && (
              <p className="mt-4 text-[15px] leading-relaxed text-[#62594e]">
                {selected.feature.tagline}
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[#ded4c5] pt-5">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#918574]">
                  Released
                </dt>
                <dd className="mt-1 text-sm text-[#315e53]">
                  {formatReleaseDate(selected.feature.releaseDate) ?? "Date not listed"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.17em] text-[#918574]">
                  Pricing
                </dt>
                <dd className="mt-1 text-sm text-[#315e53]">
                  {selected.feature.pricing || "See record"}
                </dd>
              </div>
            </dl>

            <Link
              to="/features/$slug"
              params={{ slug: selected.feature.id }}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#173f36] px-5 font-mono text-[10px] uppercase tracking-[0.19em] text-[#fffdf8] transition-colors hover:bg-[#28594d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e53]/40 focus-visible:ring-offset-2"
            >
              Open full record →
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}
