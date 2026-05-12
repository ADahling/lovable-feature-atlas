import { runRefresh, type AtlasEnv, type RunRecord } from "./scheduled";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function timingSafeEqualString(a: string, b: string): boolean {
  // Constant-time compare. Always loop the longer length so the timing
  // does not leak the shorter input's length.
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

export async function handleFeatures(env: AtlasEnv): Promise<Response> {
  try {
    if (!env.FEATURE_ATLAS_KV) {
      return new Response("null", { status: 200, headers: JSON_HEADERS });
    }
    const raw = await env.FEATURE_ATLAS_KV.get("dataset:current");
    if (!raw) {
      return new Response("null", {
        status: 200,
        headers: {
          ...JSON_HEADERS,
          "cache-control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }
    return new Response(raw, {
      status: 200,
      headers: {
        ...JSON_HEADERS,
        "cache-control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("[/api/features] failed", err);
    return new Response("null", { status: 200, headers: JSON_HEADERS });
  }
}

export async function handleStatusRuns(env: AtlasEnv): Promise<Response> {
  try {
    if (!env.FEATURE_ATLAS_KV) {
      return new Response("[]", { status: 200, headers: JSON_HEADERS });
    }
    const runs =
      (await env.FEATURE_ATLAS_KV.get<RunRecord[]>("meta:runs", "json")) ?? [];
    return new Response(JSON.stringify(runs), {
      status: 200,
      headers: { ...JSON_HEADERS, "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("[/api/status-runs] failed", err);
    return new Response("[]", { status: 200, headers: JSON_HEADERS });
  }
}

export async function handleRefresh(
  request: Request,
  env: AtlasEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const expected = env.REFRESH_TOKEN ?? "";
  const auth = request.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!expected || !timingSafeEqualString(presented, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await runRefresh(env);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

export function tryHandleApi(
  request: Request,
  env: AtlasEnv,
  url: URL,
): Promise<Response> | null {
  if (url.pathname === "/api/features") return handleFeatures(env);
  if (url.pathname === "/api/status-runs") return handleStatusRuns(env);
  if (url.pathname === "/api/refresh") return handleRefresh(request, env);
  return null;
}
