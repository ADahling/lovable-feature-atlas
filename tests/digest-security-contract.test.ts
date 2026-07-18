import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const digestSource = readFileSync(resolve(root, "src/lib/digest.functions.ts"), "utf8");
const migration = readFileSync(
  resolve(root, "supabase/migrations/20260718092500_harden_digest_security.sql"),
  "utf8",
);

describe("digest security contract", () => {
  it("removes the direct anonymous subscriber write path", () => {
    expect(migration).toContain("REVOKE ALL PRIVILEGES ON TABLE public.digest_subscribers");
    expect(migration).toContain('DROP POLICY IF EXISTS "Anon can subscribe (pending only)"');
    expect(migration).toContain('CREATE POLICY "Deny client access to digest subscribers"');
    expect(migration).toContain("AS RESTRICTIVE");
  });

  it("removes the obsolete privileged preview helper", () => {
    expect(migration).toContain("cron.unschedule('digest-preview-retry-v3')");
    expect(migration).toContain("DROP FUNCTION IF EXISTS public._digest_preview_once()");
  });

  it("does not reveal subscription membership in public responses", () => {
    expect(digestSource).toContain(
      'const SUBSCRIBE_PUBLIC_MESSAGE = "If this address is eligible, check your inbox."',
    );
    expect(digestSource).not.toContain("alreadyConfirmed");
    expect(digestSource).not.toContain("You're already on the list.");
    expect(digestSource).not.toContain("Confirmation resent.");
    expect(digestSource.match(/message: SUBSCRIBE_PUBLIC_MESSAGE/g)?.length).toBeGreaterThanOrEqual(4);
  });
});
