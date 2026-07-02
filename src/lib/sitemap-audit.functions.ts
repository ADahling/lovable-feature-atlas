import { createServerFn } from "@tanstack/react-start";

const SITE = "https://lovable-feature-atlas.lovable.app";
const SITEMAP_URL = `${SITE}/sitemap.xml`;

export type IssueSeverity = "error" | "warning";

export interface SitemapIssue {
  type: string;
  severity: IssueSeverity;
  description: string;
  count: number;
  sampleUrls: string[];
}

export interface SitemapAuditResult {
  checkedAt: string;
  sitemapUrl: string;
  totalUrls: number;
  okUrls: number;
  errorCount: number;
  warningCount: number;
  issues: SitemapIssue[];
  fetchError?: string;
}

interface UrlFinding {
  url: string;
  type: string;
  severity: IssueSeverity;
  description: string;
}

const ISSUE_DESCRIPTIONS: Record<string, string> = {
  http_4xx: "URL returned a 4xx response — Google will drop these from the index.",
  http_5xx: "URL returned a 5xx response — server error blocking crawl.",
  redirect: "URL redirects elsewhere — sitemap should list the final destination.",
  meta_noindex: "Page returns `<meta name=\"robots\" content=\"noindex\">` but is in the sitemap.",
  canonical_mismatch: "Page declares a different canonical URL than the one in the sitemap.",
  wrong_content_type: "Response is not HTML — sitemaps should only list crawlable HTML pages.",
  fetch_failed: "Could not fetch the URL (network error or timeout).",
};

function extractUrlsFromSitemap(xml: string): string[] {
  const urls: string[] = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

async function inspectUrl(url: string): Promise<UrlFinding[]> {
  const findings: UrlFinding[] = [];
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "AtlasSitemapAuditor/1.0" },
    });
  } catch (e) {
    findings.push({
      url,
      type: "fetch_failed",
      severity: "error",
      description: ISSUE_DESCRIPTIONS.fetch_failed,
    });
    return findings;
  }

  // Redirect
  if (res.status >= 300 && res.status < 400) {
    findings.push({
      url,
      type: "redirect",
      severity: "warning",
      description: ISSUE_DESCRIPTIONS.redirect,
    });
    return findings;
  }

  // 4xx / 5xx
  if (res.status >= 500) {
    findings.push({
      url,
      type: "http_5xx",
      severity: "error",
      description: ISSUE_DESCRIPTIONS.http_5xx,
    });
    return findings;
  }
  if (res.status >= 400) {
    findings.push({
      url,
      type: "http_4xx",
      severity: "error",
      description: ISSUE_DESCRIPTIONS.http_4xx,
    });
    return findings;
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) {
    findings.push({
      url,
      type: "wrong_content_type",
      severity: "warning",
      description: ISSUE_DESCRIPTIONS.wrong_content_type,
    });
    return findings;
  }

  let html = "";
  try {
    html = await res.text();
  } catch {
    return findings;
  }

  // Meta robots noindex
  const robotsMatch = html.match(
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  if (robotsMatch && /noindex/i.test(robotsMatch[1])) {
    findings.push({
      url,
      type: "meta_noindex",
      severity: "error",
      description: ISSUE_DESCRIPTIONS.meta_noindex,
    });
  }

  // Canonical mismatch
  const canonicalMatch = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
  );
  if (canonicalMatch) {
    const canonical = canonicalMatch[1].replace(/\/$/, "");
    const target = url.replace(/\/$/, "");
    if (canonical && canonical !== target) {
      findings.push({
        url,
        type: "canonical_mismatch",
        severity: "warning",
        description: `${ISSUE_DESCRIPTIONS.canonical_mismatch} Canonical: ${canonical}`,
      });
    }
  }

  return findings;
}

// In-memory cache + rate limit to prevent anonymous abuse (up to 50 outbound
// fetches per call). Cached result is served for 5 min; hard cap 1 run / 30s.
type CacheEntry = { at: number; result: SitemapAuditResult };
let cached: CacheEntry | null = null;
let lastRunAt = 0;

export const auditSitemap = createServerFn({ method: "GET" }).handler(
  async (): Promise<SitemapAuditResult> => {
    const now = Date.now();
    const c = cached;
    if (c && now - c.at < 5 * 60 * 1000) return c.result;
    if (now - lastRunAt < 30 * 1000) {
      if (c) return c.result;
      throw new Error("Rate limited: try again in a moment.");
    }
    lastRunAt = now;
    const checkedAt = new Date().toISOString();

    // 1. Fetch the sitemap
    let sitemapXml = "";
    try {
      const res = await fetch(SITEMAP_URL, {
        headers: { "User-Agent": "AtlasSitemapAuditor/1.0" },
      });
      if (!res.ok) {
        return {
          checkedAt,
          sitemapUrl: SITEMAP_URL,
          totalUrls: 0,
          okUrls: 0,
          errorCount: 0,
          warningCount: 0,
          issues: [],
          fetchError: `Sitemap returned HTTP ${res.status}`,
        };
      }
      sitemapXml = await res.text();
    } catch (e) {
      return {
        checkedAt,
        sitemapUrl: SITEMAP_URL,
        totalUrls: 0,
        okUrls: 0,
        errorCount: 0,
        warningCount: 0,
        issues: [],
        fetchError: e instanceof Error ? e.message : "Failed to fetch sitemap",
      };
    }

    const urls = extractUrlsFromSitemap(sitemapXml);
    if (urls.length === 0) {
      return {
        checkedAt,
        sitemapUrl: SITEMAP_URL,
        totalUrls: 0,
        okUrls: 0,
        errorCount: 0,
        warningCount: 0,
        issues: [],
        fetchError: "Sitemap contained no <loc> entries",
      };
    }

    // 2. Inspect every URL in parallel (cap at 50 to be safe)
    const capped = urls.slice(0, 50);
    const findingsPerUrl = await Promise.all(capped.map((u) => inspectUrl(u)));
    const allFindings = findingsPerUrl.flat();

    // 3. Aggregate by issue type
    const grouped = new Map<string, SitemapIssue>();
    for (const f of allFindings) {
      const existing = grouped.get(f.type);
      if (existing) {
        existing.count += 1;
        if (existing.sampleUrls.length < 5 && !existing.sampleUrls.includes(f.url)) {
          existing.sampleUrls.push(f.url);
        }
      } else {
        grouped.set(f.type, {
          type: f.type,
          severity: f.severity,
          description: f.description,
          count: 1,
          sampleUrls: [f.url],
        });
      }
    }

    const issues = Array.from(grouped.values()).sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === "error" ? -1 : 1;
      return b.count - a.count;
    });

    const errorCount = issues
      .filter((i) => i.severity === "error")
      .reduce((acc, i) => acc + i.count, 0);
    const warningCount = issues
      .filter((i) => i.severity === "warning")
      .reduce((acc, i) => acc + i.count, 0);

    // A URL is "OK" if it produced no findings
    const urlsWithIssues = new Set(allFindings.map((f) => f.url));
    const okUrls = capped.length - urlsWithIssues.size;

    return {
      checkedAt,
      sitemapUrl: SITEMAP_URL,
      totalUrls: capped.length,
      okUrls,
      errorCount,
      warningCount,
      issues,
    };
  },
);
