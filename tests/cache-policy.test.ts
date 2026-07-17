import { describe, expect, it } from "vitest";
import {
  buildHtmlCacheKey,
  getHtmlCacheDecision,
  isAllowlistedPublicHtmlPath,
  isCacheableHtmlResponse,
  isEdgeHtmlCacheEnabled,
  isSensitiveHtmlPath,
} from "../src/lib/cache-policy";

const enabledEnv = { ATLAS_EDGE_HTML_CACHE: "true" };

describe("public HTML cache policy", () => {
  it("is disabled unless the explicit rollout flag is 1 or true", () => {
    expect(isEdgeHtmlCacheEnabled(undefined)).toBe(false);
    expect(isEdgeHtmlCacheEnabled({ ATLAS_EDGE_HTML_CACHE: "yes" })).toBe(false);
    expect(isEdgeHtmlCacheEnabled({ ATLAS_EDGE_HTML_CACHE: "0" })).toBe(false);
    expect(isEdgeHtmlCacheEnabled({ ATLAS_EDGE_HTML_CACHE: "1" })).toBe(true);
    expect(isEdgeHtmlCacheEnabled({ ATLAS_EDGE_HTML_CACHE: "TRUE" })).toBe(true);
  });

  it.each([
    "/",
    "/about",
    "/constellation/",
    "/features/visual-edits",
    "/categories/ai-design",
    "/digest",
    "/digest/123e4567-e89b-12d3-a456-426614174000",
    "/draw",
    "/quiz",
    "/status",
    "/vs/cursor",
    "/vs/v0",
  ])("allowlists the public HTML route %s", (pathname) => {
    expect(isAllowlistedPublicHtmlPath(pathname)).toBe(true);
    expect(
      getHtmlCacheDecision(new Request(`https://atlas.example${pathname}`), enabledEnv),
    ).toEqual({ eligible: true, reason: "public-html" });
  });

  it.each([
    "/api/public/refresh-features",
    "/admin/digest",
    "/mcp",
    "/.mcp/list-tools",
    "/.well-known/oauth-protected-resource",
    "/oauth/callback",
    "/lovable/email/auth/webhook",
    "/digest/confirm",
    "/digest/unsubscribe",
  ])("hard-denies the sensitive route %s", (pathname) => {
    expect(isSensitiveHtmlPath(pathname)).toBe(true);
    expect(
      getHtmlCacheDecision(new Request(`https://atlas.example${pathname}`), enabledEnv),
    ).toEqual({ eligible: false, reason: "sensitive-path" });
  });

  it("bypasses queries, credentials, writes, and unlisted routes", () => {
    expect(
      getHtmlCacheDecision(new Request("https://atlas.example/features/foo?preview=1"), enabledEnv),
    ).toEqual({ eligible: false, reason: "query" });
    expect(
      getHtmlCacheDecision(
        new Request("https://atlas.example/features/foo", { headers: { Cookie: "session=x" } }),
        enabledEnv,
      ),
    ).toEqual({ eligible: false, reason: "credentials" });
    expect(
      getHtmlCacheDecision(
        new Request("https://atlas.example/features/foo", {
          headers: { Authorization: "Bearer secret" },
        }),
        enabledEnv,
      ),
    ).toEqual({ eligible: false, reason: "credentials" });
    expect(
      getHtmlCacheDecision(
        new Request("https://atlas.example/features/foo", { method: "POST" }),
        enabledEnv,
      ),
    ).toEqual({ eligible: false, reason: "method" });
    expect(
      getHtmlCacheDecision(new Request("https://atlas.example/seo-audit"), enabledEnv),
    ).toEqual({ eligible: false, reason: "not-allowlisted" });
  });

  it("permits clean HEAD requests without weakening GET policy", () => {
    expect(
      getHtmlCacheDecision(
        new Request("https://atlas.example/features/foo", { method: "HEAD" }),
        enabledEnv,
      ),
    ).toEqual({ eligible: true, reason: "public-html" });
  });

  it("only accepts safe 200 HTML responses without cookies", () => {
    expect(
      isCacheableHtmlResponse(
        new Response("<html></html>", { headers: { "Content-Type": "text/html; charset=utf-8" } }),
      ),
    ).toBe(true);
    expect(
      isCacheableHtmlResponse(
        new Response("no", { status: 404, headers: { "Content-Type": "text/html" } }),
      ),
    ).toBe(false);
    expect(
      isCacheableHtmlResponse(
        new Response("{}", { headers: { "Content-Type": "application/json" } }),
      ),
    ).toBe(false);
    expect(
      isCacheableHtmlResponse(
        new Response("<html></html>", {
          headers: { "Content-Type": "text/html", "Set-Cookie": "session=secret" },
        }),
      ),
    ).toBe(false);
    expect(
      isCacheableHtmlResponse(
        new Response("<html></html>", {
          headers: { "Content-Type": "text/html", "Cache-Control": "private, max-age=60" },
        }),
      ),
    ).toBe(false);
  });

  it("includes the build version in an internal GET cache key", () => {
    const request = new Request("https://atlas.example/features/foo", { method: "HEAD" });
    const first = buildHtmlCacheKey(request, "build-a");
    const second = buildHtmlCacheKey(request, "build-b");

    expect(first.method).toBe("GET");
    expect(new URL(first.url).searchParams.get("__atlas_html_build")).toBe("build-a");
    expect(first.url).not.toBe(second.url);
  });
});
