// Category → glyph mapping used for card watermarks, tarot medallions,
// and the constellation preview drawer. Backed by an authored monoline
// SVG system in `CategoryGlyph.tsx` — one distinct silhouette per
// category. `App Connectors` intentionally keeps the lucide `Plug` icon
// (the site's original watermark) so its plug shape survives as the
// signature of that one category.

import { Plug, type LucideIcon } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  glyphForCategory,
  type CategoryGlyphProps,
} from "../components/atlas/CategoryGlyph";

/**
 * The consumer-facing type accepts either a lucide icon or one of the
 * authored glyphs — both expose the same size / strokeWidth / stroke
 * surface so downstream JSX (`<Icon size={64} strokeWidth={1.2} />`)
 * works uniformly.
 */
export type CategoryIcon =
  | LucideIcon
  | ForwardRefExoticComponent<CategoryGlyphProps & RefAttributes<SVGSVGElement>>;

export function iconForCategory(name: string): CategoryIcon {
  if (name === "App Connectors") return Plug;
  return glyphForCategory(name);
}
