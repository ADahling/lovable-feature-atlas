import { forwardRef, type ReactElement, type SVGProps } from "react";

/**
 * Authored monoline glyph system — one distinct silhouette per Atlas
 * category, drawn to match the site's 1.5px line weight. API is
 * compatible with `lucide-react` icon components (size / strokeWidth /
 * stroke / fill) so existing consumers (feature card watermark, tarot
 * medallion, constellation drawer) work without changes.
 *
 * Every glyph is a 24×24 viewBox with `currentColor` fallback so it can
 * be tinted through the ambient text color when `stroke` isn't set.
 */

export interface CategoryGlyphProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

const BASE_STROKE = 1.5;

function makeGlyph(
  name: string,
  paths: (color: string, sw: number) => ReactElement,
) {
  const Glyph = forwardRef<SVGSVGElement, CategoryGlyphProps>(function CategoryGlyphInner(
    { size = 24, strokeWidth = BASE_STROKE, stroke, fill = "none", className, ...rest },
    ref,
  ) {
    const color = (stroke as string) ?? "currentColor";
    const sw = typeof strokeWidth === "number" ? strokeWidth : Number(strokeWidth) || BASE_STROKE;
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill as string}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        {paths(color, sw)}
      </svg>
    );
  });
  Glyph.displayName = `CategoryGlyph.${name}`;
  return Glyph;
}

// ─────────────────────────────────────────────────────────────────────
// The 18 authored glyphs
// ─────────────────────────────────────────────────────────────────────

const Agent = makeGlyph("Agent", () => (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </>
));

const AiModels = makeGlyph("AiModels", () => (
  <>
    <ellipse cx="12" cy="12" rx="9" ry="3.2" />
    <ellipse cx="12" cy="12" rx="6.2" ry="2.2" />
    <ellipse cx="12" cy="12" rx="3.4" ry="1.3" />
    <path d="M12 8.8V4M12 15.2V20" />
  </>
));

const AppConnectors = makeGlyph("AppConnectors", () => (
  <>
    <path d="M7 4.5l3.5 2v4L7 12.5l-3.5-2v-4L7 4.5z" />
    <path d="M17 11.5l3.5 2v4L17 19.5l-3.5-2v-4L17 11.5z" />
    <path d="M10.5 8.5l3 5" />
  </>
));

const Cloud = makeGlyph("Cloud", () => (
  <>
    <path d="M6.5 15.5a3.5 3.5 0 0 1 .8-6.9 5 5 0 0 1 9.7 1.1 3.2 3.2 0 0 1-.7 6.3H8" />
    <path d="M5 19.5h14" strokeDasharray="0.5 2.2" />
  </>
));

const Community = makeGlyph("Community", () => (
  <>
    <circle cx="12" cy="7.5" r="2.7" />
    <circle cx="6.8" cy="15.8" r="2.7" />
    <circle cx="17.2" cy="15.8" r="2.7" />
    <path d="M9.2 12.5l1.6 1.5M14.8 12.5l-1.6 1.5M9.2 16.8h5.6" opacity="0.55" />
  </>
));

const Deploy = makeGlyph("Deploy", () => (
  <>
    <path d="M4 13.5L20 4l-4 16-4-6.5L4 13.5z" />
    <path d="M12 13.5L20 4" />
    <circle cx="6.5" cy="18" r="0.9" fill="currentColor" stroke="none" />
  </>
));

const Editor = makeGlyph("Editor", () => (
  <>
    <path d="M8 5l-4 7 4 7" />
    <path d="M16 5l4 7-4 7" />
    <path d="M12 8v8" />
    <path d="M10.6 8h2.8M10.6 16h2.8" opacity="0.75" />
  </>
));

const Email = makeGlyph("Email", () => (
  <>
    <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
    <path d="M3.7 6.6l8.3 6 8.3-6" />
    <path d="M3.7 17.4l6.2-5.4M20.3 17.4l-6.2-5.4" opacity="0.55" />
  </>
));

const Integrations = makeGlyph("Integrations", () => (
  <>
    <path d="M9.5 14.5l-2.6 2.6a3.2 3.2 0 1 1-4.5-4.5l2.6-2.6" />
    <path d="M14.5 9.5l2.6-2.6a3.2 3.2 0 1 1 4.5 4.5l-2.6 2.6" />
    <path d="M8.5 15.5l7-7" />
  </>
));

const McpConnectors = makeGlyph("McpConnectors", () => (
  <>
    <circle cx="12" cy="12" r="2.4" />
    <circle cx="12" cy="4.2" r="1.6" />
    <circle cx="12" cy="19.8" r="1.6" />
    <circle cx="4.2" cy="12" r="1.6" />
    <circle cx="19.8" cy="12" r="1.6" />
    <path d="M12 5.8v3.8M12 14.4v3.8M5.8 12h3.8M14.4 12h3.8" />
  </>
));

const Mobile = makeGlyph("Mobile", () => (
  <>
    <rect x="7" y="2.8" width="10" height="18.4" rx="2.2" transform="rotate(-4 12 12)" />
    <path d="M10.7 4.6h2.6" opacity="0.6" />
    <circle cx="12" cy="18.6" r="0.7" fill="currentColor" stroke="none" transform="rotate(-4 12 12)" />
  </>
));

const Platform = makeGlyph("Platform", () => (
  <>
    <path d="M4 7.5l8-3.5 8 3.5-8 3.5-8-3.5z" />
    <path d="M4 12l8 3.5 8-3.5" />
    <path d="M4 16.5l8 3.5 8-3.5" />
  </>
));

const Productivity = makeGlyph("Productivity", () => (
  <>
    <rect x="3.5" y="4" width="6" height="6" rx="1" />
    <path d="M5.5 7l1.4 1.4L8.7 6.4" />
    <path d="M12.5 5.5h8M12.5 8.5h5" opacity="0.85" />
    <path d="M12.5 13.5h8M12.5 16.5h5" opacity="0.85" />
    <rect x="3.5" y="12" width="6" height="6" rx="1" />
    <path d="M5.5 15l1.4 1.4L8.7 14.4" />
  </>
));

const Publishing = makeGlyph("Publishing", () => (
  <>
    <path d="M12 5.5c-2.4-1.2-5.1-1.5-8-.9v13c2.9-.6 5.6-.3 8 .9 2.4-1.2 5.1-1.5 8-.9v-13c-2.9-.6-5.6-.3-8 .9z" />
    <path d="M12 5.5v13" />
  </>
));

const Security = makeGlyph("Security", () => (
  <>
    <path d="M12 3.5l7.5 2.5v6c0 4.4-3.1 7.6-7.5 8.5-4.4-.9-7.5-4.1-7.5-8.5v-6L12 3.5z" />
    <path d="M12 9.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 17.7l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5L12 9.5z" opacity="0.65" />
  </>
));

const Testing = makeGlyph("Testing", () => (
  <>
    <path d="M9.5 3.5v5.2L4.7 17a2 2 0 0 0 1.8 3h11a2 2 0 0 0 1.8-3l-4.8-8.3V3.5" />
    <path d="M8.5 3.5h7" />
    <circle cx="10.5" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="13.8" cy="17.2" r="0.6" fill="currentColor" stroke="none" />
  </>
));

const Workflow = makeGlyph("Workflow", () => (
  <>
    <rect x="3" y="9.5" width="5" height="5" rx="0.8" />
    <rect x="16" y="4" width="5" height="5" rx="0.8" />
    <rect x="16" y="15" width="5" height="5" rx="0.8" />
    <path d="M8 12l4.5-4.5H16" />
    <path d="M8 12l4.5 5.5H16" />
  </>
));

const Workspace = makeGlyph("Workspace", () => (
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="M3.5 9h17" />
    <path d="M9 9v10.5" />
    <path d="M14 14.5h6" opacity="0.7" />
    <path d="M14 12h6" opacity="0.7" />
    <path d="M14 17h4" opacity="0.7" />
  </>
));

const Fallback = makeGlyph("Fallback", () => (
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2.5" />
  </>
));

const GLYPHS: Record<string, ReturnType<typeof makeGlyph>> = {
  Agent,
  "AI Models": AiModels,
  "App Connectors": AppConnectors,
  Cloud,
  Community,
  Deploy,
  Editor,
  Email,
  Integrations,
  "MCP Connectors": McpConnectors,
  Mobile,
  Platform,
  Productivity,
  Publishing,
  Security,
  Testing,
  Workflow,
  Workspace,
};

/** Look up the authored glyph for a category name. */
export function glyphForCategory(name: string) {
  return GLYPHS[name] ?? Fallback;
}
