import { FeatureRecord } from "./features-schema";

const RSS_URL = "https://docs.lovable.dev/changelog/rss.xml";
const USER_AGENT = "LovableFeatureAtlas/1.0 (+contact)";
const BACKOFF_MS = [1000, 4000, 16000];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function pickTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

function pickCData(block: string, tag: string): string | null {
  const re = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
    "i",
  );
  const m = block.match(re);
  if (m) return m[1];
  return pickTag(block, tag);
}

function isoDate(input: string | null): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function classifyCategory(h3: string): string {
  const t = h3.trim();
  if (/^Removed\b/i.test(t)) return "Removed";
  if (/App connectors:/i.test(t)) return "Integrations";
  if (/Chat connectors:/i.test(t) || /\bMCP\b/.test(t)) return "MCP Connectors";
  if (/Security/i.test(t)) return "Security";
  if (/Cloud|Database/i.test(t)) return "Cloud";
  if (/Improvements and bug fixes/i.test(t)) return "Editor";
  return "Feature";
}

function classifyStatus(h3: string): "GA" | "Beta" | "Removed" {
  if (/\(Beta\)/i.test(h3)) return "Beta";
  if (/^Removed\b/i.test(h3.trim())) return "Removed";
  return "GA";
}

function classifyPricing(chunk: string): string {
  const m = chunk.match(
    /Available on (Free, Pro, and Business|paid|Business and Enterprise|Enterprise) plans/i,
  );
  if (!m) return "All plans";
  return `Available on ${m[1]} plans`;
}

function cleanName(h3Inner: string): string {
  return h3Inner
    .replace(/<[^>]+>/g, "")
    .replace(/\s*\((Beta|Coming soon)\)\s*$/i, "")
    .trim();
}

function firstSentence(s: string): string {
  if (!s) return "";
  const idx = s.indexOf(". ");
  return idx === -1 ? s : s.slice(0, idx + 1).trim();
}

function extractCapabilities(chunk: string): string[] {
  const ulMatch = chunk.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (!ulMatch) return [];
  const items: string[] = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRe.exec(ulMatch[1]))) {
    const text = stripTags(m[1]);
    if (text) items.push(text);
  }
  return items;
}

function extractDescription(chunk: string): string {
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const parts: string[] = [];
  let m;
  while ((m = pRe.exec(chunk))) {
    const t = stripTags(m[1]);
    if (t) parts.push(t);
  }
  if (parts.length) return parts.join(" ");
  return stripTags(chunk);
}

async function fetchWithRetry(url: string): Promise<string> {
  let lastErr: unknown = new Error("no attempts");
  for (let attempt = 0; attempt < BACKOFF_MS.length; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
      });
      if (res.ok) return await res.text();
      lastErr = new Error(`HTTP ${res.status} on attempt ${attempt + 1}`);
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function fetchAndParse(): Promise<FeatureRecord[]> {
  const xml = await fetchWithRetry(RSS_URL);

  const records: FeatureRecord[] = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  let itemMatch;

  while ((itemMatch = itemRe.exec(xml))) {
    const itemBlock = itemMatch[0];
    const link = pickTag(itemBlock, "link") ?? "";
    const pubDate = pickTag(itemBlock, "pubDate");
    const guidRaw = pickTag(itemBlock, "guid") ?? link;
    const guidSlug = slugify(guidRaw.replace(/^https?:\/\//, ""));
    const releaseDate = isoDate(pubDate);
    if (!releaseDate) continue;

    const content = pickCData(itemBlock, "content:encoded");
    if (!content) continue;

    const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3[^>]*>|$)/gi;
    let h3Match;
    while ((h3Match = h3Re.exec(content))) {
      const h3InnerRaw = h3Match[1];
      const chunkBody = h3Match[2];
      const h3Plain = stripTags(h3InnerRaw);
      const name = cleanName(h3Plain);
      if (!name) continue;

      const anchor = slugify(h3Plain);
      const id = `${guidSlug}-${anchor}`.slice(0, 120) || `entry-${records.length}`;
      const description = extractDescription(chunkBody);
      if (!description) continue;
      const tagline = firstSentence(description) || name;

      const candidate = {
        id,
        name,
        category: classifyCategory(h3Plain),
        status: classifyStatus(h3Plain),
        releaseDate,
        pricing: classifyPricing(chunkBody),
        icon: "✨",
        tagline,
        description,
        capabilities: extractCapabilities(chunkBody),
        useCases: [] as string[],
        source: link ? `${link}#${anchor}` : "https://docs.lovable.dev/changelog",
      };

      const parsed = FeatureRecord.safeParse(candidate);
      if (parsed.success) {
        records.push(parsed.data);
      } else {
        console.log(
          "[scraper] dropped invalid record",
          candidate.id,
          parsed.error.flatten(),
        );
      }
    }
  }

  return records;
}
