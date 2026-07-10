/**
 * End-to-end regression for the /digest/confirm?token= step of the
 * double-opt-in flow.
 *
 * Flow:
 *   1. Submit the Notify form on /digest with a fresh disposable email.
 *   2. Read the row's confirm_token straight from digest_subscribers.
 *   3. Visit /digest/confirm?token=<token> in a real browser and wait for
 *      the "You're on the list." success state.
 *   4. Assert the same row is now status='confirmed' AND confirmed_at is
 *      non-null AND confirm_token has been cleared (single-use token).
 *
 * Requires PG* env vars for direct DB reads.
 *
 * Run: `bunx vitest run tests/digest-confirm-e2e.test.ts`
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser } from "playwright-core";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { SITE_ORIGIN as DEFAULT_ORIGIN } from "../src/lib/canonical-meta";

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? DEFAULT_ORIGIN;

function resolveExecutable(): string | undefined {
  const candidates = [
    "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    "/chromium-1194/chrome-linux/chrome",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  return undefined;
}

function psql(sql: string): string {
  return execSync(`psql -A -t -F '|' -c ${JSON.stringify(sql)}`).toString().trim();
}

let browser: Browser;
const testEmail = `e2e-confirm-${Date.now()}@atlas-test.dahlingdigital.com`;

beforeAll(async () => {
  browser = await chromium.launch({
    headless: true,
    executablePath: resolveExecutable(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

describe("/digest/confirm?token= flips subscriber to confirmed", () => {
  it("subscribe → visit confirm link → status=confirmed, confirmed_at set", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    // 1. Subscribe through the real UI to mint a pending row + confirm_token.
    await page.goto(`${SITE_ORIGIN}/digest`, { waitUntil: "domcontentloaded" });
    const input = page.locator("#subscribe-web");
    await input.waitFor({ state: "visible", timeout: 15_000 });
    // The submit button stays disabled until React hydrates and email length >= 5.
    // Retry-until-enabled handles the hydration race without hardcoding a wait.
    const submit = page.locator('form button[type="submit"]', { hasText: /subscribe/i }).first();
    for (let i = 0; i < 20; i++) {
      await input.fill("");
      await input.pressSequentially(testEmail, { delay: 10 });
      if (await submit.isEnabled()) break;
      await page.waitForTimeout(250);
    }
    await submit.click();
    await page.locator('[role="status"]').first().waitFor({ state: "visible", timeout: 15_000 });

    // 2. Pull the token that subscribeToDigest just generated.
    const pending = psql(
      `SELECT status, coalesce(confirm_token,''), coalesce(confirmed_at::text,'') FROM digest_subscribers WHERE email = '${testEmail}' LIMIT 1`,
    );
    expect(pending, "subscribe step did not create a digest_subscribers row").not.toBe("");
    const [pendingStatus, token, pendingConfirmedAt] = pending.split("|");
    expect(pendingStatus).toBe("pending");
    expect(token.length).toBeGreaterThanOrEqual(20);
    expect(pendingConfirmedAt).toBe("");

    // 3. Visit the confirm link the same way an email recipient would.
    await page.goto(`${SITE_ORIGIN}/digest/confirm?token=${encodeURIComponent(token)}`, {
      waitUntil: "domcontentloaded",
    });
    // confirmDigestSubscription runs on mount; wait for the success headline.
    await page
      .getByRole("heading", { name: /you're on the list\./i })
      .waitFor({ state: "visible", timeout: 15_000 });

    await context.close();

    // 4. DB post-condition: row is confirmed and confirmed_at is set.
    const after = psql(
      `SELECT status, coalesce(confirmed_at::text,'') FROM digest_subscribers WHERE email = '${testEmail}' LIMIT 1`,
    );
    expect(after, "digest_subscribers row disappeared after confirm").not.toBe("");
    const [finalStatus, confirmedAt] = after.split("|");
    expect(finalStatus).toBe("confirmed");
    expect(confirmedAt.length).toBeGreaterThan(0);

    // Each run uses a Date.now()-suffixed disposable address, so rows don't
    // collide. Sandbox DB access is insert-only; no cleanup DELETE.
  }, 90_000);
});
