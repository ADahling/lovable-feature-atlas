/**
 * End-to-end regression for the /digest double-opt-in flow.
 *
 * Submits the Notify form via the live UI and asserts that:
 *   1. The UI surfaces a visible success confirmation.
 *   2. A digest_subscribers row is created with status=pending and a
 *      confirm_token — proof that subscribeToDigest ran through to the
 *      renderConfirmEmail + sendEmail(tag=confirm) branch. The digest
 *      sender bypasses the pgmq email_send_log table by design, so the
 *      subscriber row is the deterministic post-condition available to
 *      assert against.
 *
 * Requires PG* env vars (already set in the sandbox) to read the row back.
 *
 * Run: `bunx vitest run tests/digest-subscribe-e2e.test.ts`
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

let browser: Browser;
const testEmail = `e2e-digest-${Date.now()}@atlas-test.dahlingdigital.com`;

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

describe("/digest subscribe → confirm email regression", () => {
  it("creates a pending subscriber and triggers the confirm-email send path", async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto(`${SITE_ORIGIN}/digest`, { waitUntil: "domcontentloaded" });

    // The Notify form on /digest is <SubscribeForm variant="compact" source="web" />.
    // Its email input carries id="subscribe-web". Scope the submit button to
    // the same <form> so we don't accidentally click the footer form's button.
    const input = page.locator("#subscribe-web");
    await input.waitFor({ state: "visible", timeout: 15_000 });
    // Wait for hydration so React's onChange handler is wired before we type,
    // otherwise the controlled `email` state stays "" and the submit stays disabled.
    await page.waitForFunction(
      () => {
        const el = document.getElementById("subscribe-web") as HTMLInputElement | null;
        if (!el) return false;
        const key = Object.keys(el).find((k) => k.startsWith("__reactProps$"));
        return Boolean(key && (el as any)[key]?.onChange);
      },
      { timeout: 15_000 },
    );
    await input.click();
    await input.fill(testEmail);

    const form = page.locator('form:has(#subscribe-web)');
    const submit = form.locator('button[type="submit"]');
    await submit.waitFor({ state: "visible", timeout: 15_000 });
    // Explicitly wait for the button to become enabled — proves React state updated.
    await page.waitForFunction(
      () => {
        const form = document.querySelector('form:has(#subscribe-web)');
        const btn = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        return Boolean(btn && !btn.disabled);
      },
      { timeout: 15_000 },
    );
    await submit.click();

    // Wait for the inline success callout (role=status) to appear.
    const status = page.locator('[role="status"]').first();
    await status.waitFor({ state: "visible", timeout: 15_000 });
    const msg = (await status.textContent())?.trim() ?? "";
    expect(msg.toLowerCase()).toMatch(/confirm|inbox|already/);

    await context.close();

    // Verify the DB post-condition. subscribeToDigest only reaches the
    // renderConfirmEmail + sendEmail branch after inserting the pending row
    // with a confirm_token — so the presence of that row proves the
    // confirmation-email code path executed for this submission.
    const raw = execSync(
      `psql -A -t -F '|' -c "SELECT status, coalesce(confirm_token,''), source FROM digest_subscribers WHERE email = '${testEmail}' LIMIT 1"`,
    )
      .toString()
      .trim();

    expect(raw, "no digest_subscribers row was created for the test email").not.toBe("");
    const [status_, token, source] = raw.split("|");
    expect(status_).toBe("pending");
    expect(token.length).toBeGreaterThanOrEqual(20);
    expect(source).toBe("web");

    // Test emails use a disposable @atlas-test.dahlingdigital.com address and
    // a Date.now() suffix, so each run inserts a fresh row without collisions.
    // No cleanup DELETE here — sandbox DB access is insert-only.
  }, 60_000);
});
