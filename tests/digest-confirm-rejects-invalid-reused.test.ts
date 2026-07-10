/**
 * /digest/confirm rejection tests.
 *
 *   1. A random/invalid token renders the "This link isn't valid." state
 *      and does NOT flip any subscriber row to confirmed.
 *   2. Visiting the confirm link a SECOND time after the subscriber is
 *      already confirmed renders the friendly "already" state — it must
 *      not re-fire a confirmation email (digest_email_log stays flat).
 *
 * Requires PG* env vars for direct DB reads.
 *
 * Run: `bunx vitest run tests/digest-confirm-rejects-invalid-reused.test.ts`
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

describe("/digest/confirm rejects invalid & reused tokens", () => {
  it("random/bogus token → 'This link isn't valid.' state", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    // 32 hex chars — passes client-side length/regex but no row matches.
    const bogus = "deadbeef".repeat(4);
    await page.goto(`${SITE_ORIGIN}/digest/confirm?token=${bogus}`, {
      waitUntil: "domcontentloaded",
    });

    await page
      .getByRole("heading", { name: /this link isn't valid\./i })
      .waitFor({ state: "visible", timeout: 15_000 });

    // Sanity: no digest_subscribers row now claims that bogus confirm_token.
    const hit = psql(
      `SELECT count(*) FROM digest_subscribers WHERE confirm_token = '${bogus}'`,
    );
    expect(hit).toBe("0");

    await context.close();
  }, 60_000);

  it("reused token after confirm → 'already' state, no new confirmation email", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const testEmail = `e2e-reuse-${Date.now()}@atlas-test.dahlingdigital.com`;

    // 1. Subscribe through the real UI to mint a pending row + confirm_token.
    await page.goto(`${SITE_ORIGIN}/digest`, { waitUntil: "domcontentloaded" });
    const input = page.locator("#subscribe-web");
    await input.waitFor({ state: "visible", timeout: 15_000 });
    const submit = page
      .locator('form button[type="submit"]', { hasText: /subscribe/i })
      .first();
    for (let i = 0; i < 20; i++) {
      await input.fill("");
      await input.pressSequentially(testEmail, { delay: 10 });
      if (await submit.isEnabled()) break;
      await page.waitForTimeout(250);
    }
    await submit.click();
    await page.locator('[role="status"]').first().waitFor({ state: "visible", timeout: 15_000 });

    const pending = psql(
      `SELECT coalesce(confirm_token,'') FROM digest_subscribers WHERE email = '${testEmail}' LIMIT 1`,
    );
    expect(pending, "subscribe did not create a row").not.toBe("");
    const token = pending;
    expect(token.length).toBeGreaterThanOrEqual(20);

    // 2. First confirm visit → success.
    await page.goto(`${SITE_ORIGIN}/digest/confirm?token=${encodeURIComponent(token)}`, {
      waitUntil: "domcontentloaded",
    });
    await page
      .getByRole("heading", { name: /you're on the list\./i })
      .waitFor({ state: "visible", timeout: 15_000 });

    // Snapshot how many confirm-tagged emails have been logged for this
    // recipient so far. Anything higher after the reused visit = regression.
    const beforeCount = psql(
      `SELECT count(*) FROM digest_email_log WHERE recipient = '${testEmail}' AND tag = 'confirm'`,
    );

    // 3. Second visit with the SAME token, subscriber already confirmed.
    await page.goto(`${SITE_ORIGIN}/digest/confirm?token=${encodeURIComponent(token)}`, {
      waitUntil: "domcontentloaded",
    });
    await page
      .getByRole("heading", { name: /already confirmed\.?/i })
      .waitFor({ state: "visible", timeout: 15_000 });

    // The "This link isn't valid." heading must NOT be visible — reused
    // token on a confirmed row is a friendly no-op, not an error.
    const invalidCount = await page
      .getByRole("heading", { name: /this link isn't valid\./i })
      .count();
    expect(invalidCount).toBe(0);

    // 4. Row still confirmed; second visit did not downgrade it.
    const after = psql(
      `SELECT status FROM digest_subscribers WHERE email = '${testEmail}' LIMIT 1`,
    );
    expect(after).toBe("confirmed");

    // 5. No new confirmation email was logged as a side-effect of the reuse.
    const afterCount = psql(
      `SELECT count(*) FROM digest_email_log WHERE recipient = '${testEmail}' AND tag = 'confirm'`,
    );
    expect(afterCount).toBe(beforeCount);

    await context.close();
  }, 120_000);
});
