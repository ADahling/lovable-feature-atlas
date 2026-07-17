import { describe, expect, it, vi } from "vitest";
import {
  type AtlasHtmlCache,
  serveWithPublicHtmlCache,
} from "../src/lib/cache-policy";

const enabledEnv = { ATLAS_EDGE_HTML_CACHE: "1" };

class MemoryCache implements AtlasHtmlCache {
  readonly entries = new Map<string, Response>();
  readonly match = vi.fn(async (request: Request) => this.entries.get(request.url)?.clone());
  readonly put = vi.fn(async (request: Request, response: Response) => {
    this.entries.set(request.url, response.clone());
  });
}

function html(body = "<html>origin</html>", init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(body, { ...init, headers });
}

describe("server public HTML cache lane", () => {
  it("serves MISS then HIT and only calls SSR once", async () => {
    const cache = new MemoryCache();
    const origin = vi.fn(async () => html());

    const miss = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/features/foo"),
      env: enabledEnv,
      ctx: null,
      cache,
      buildVersion: "test-build",
      fetchOrigin: origin,
    });
    expect(miss.headers.get("X-Atlas-Cache")).toBe("MISS");
    expect(await miss.text()).toBe("<html>origin</html>");

    const hit = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/features/foo"),
      env: enabledEnv,
      ctx: null,
      cache,
      buildVersion: "test-build",
      fetchOrigin: origin,
    });
    expect(hit.headers.get("X-Atlas-Cache")).toBe("HIT");
    expect(await hit.text()).toBe("<html>origin</html>");
    expect(origin).toHaveBeenCalledTimes(1);
  });

  it("bypasses the cache when disabled or when a request carries credentials", async () => {
    const cache = new MemoryCache();
    const origin = vi.fn(async () => html());

    const disabled = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/"),
      env: {},
      ctx: null,
      cache,
      fetchOrigin: origin,
    });
    const credentialed = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/", { headers: { Cookie: "session=x" } }),
      env: enabledEnv,
      ctx: null,
      cache,
      fetchOrigin: origin,
    });

    expect(disabled.headers.get("X-Atlas-Cache")).toBe("BYPASS");
    expect(credentialed.headers.get("X-Atlas-Cache")).toBe("BYPASS");
    expect(cache.match).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it.each([
    ["non-200", () => html("error", { status: 500 })],
    ["non-HTML", () => new Response("{}", { headers: { "Content-Type": "application/json" } })],
    [
      "Set-Cookie",
      () => html("private", { headers: { "Set-Cookie": "session=secret; HttpOnly" } }),
    ],
  ])("never stores a %s response", async (_label, response) => {
    const cache = new MemoryCache();
    const result = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/features/foo"),
      env: enabledEnv,
      ctx: null,
      cache,
      fetchOrigin: async () => response(),
    });

    expect(result.headers.get("X-Atlas-Cache")).toBe("BYPASS");
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("fails open when cache lookup throws", async () => {
    const cache: AtlasHtmlCache = {
      match: vi.fn(async () => {
        throw new Error("cache unavailable");
      }),
      put: vi.fn(),
    };
    const origin = vi.fn(async () => html("<html>safe origin</html>"));

    const result = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/"),
      env: enabledEnv,
      ctx: null,
      cache,
      fetchOrigin: origin,
    });

    expect(result.status).toBe(200);
    expect(result.headers.get("X-Atlas-Cache")).toBe("BYPASS");
    expect(await result.text()).toContain("safe origin");
  });

  it("fails open when cache storage throws", async () => {
    const cache: AtlasHtmlCache = {
      match: vi.fn(async () => undefined),
      put: vi.fn(async () => {
        throw new Error("cache write failed");
      }),
    };

    const result = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/"),
      env: enabledEnv,
      ctx: null,
      cache,
      fetchOrigin: async () => html("<html>safe origin</html>"),
    });

    expect(result.status).toBe(200);
    expect(result.headers.get("X-Atlas-Cache")).toBe("MISS");
    expect(await result.text()).toContain("safe origin");
  });

  it("serves HEAD from a populated GET entry without returning a body", async () => {
    const cache = new MemoryCache();
    const origin = vi.fn(async () => html("<html>cached body</html>"));

    await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/about"),
      env: enabledEnv,
      ctx: null,
      cache,
      fetchOrigin: origin,
    });
    const head = await serveWithPublicHtmlCache({
      request: new Request("https://atlas.example/about", { method: "HEAD" }),
      env: enabledEnv,
      ctx: null,
      cache,
      fetchOrigin: origin,
    });

    expect(head.headers.get("X-Atlas-Cache")).toBe("HIT");
    expect(await head.text()).toBe("");
    expect(origin).toHaveBeenCalledTimes(1);
  });
});
