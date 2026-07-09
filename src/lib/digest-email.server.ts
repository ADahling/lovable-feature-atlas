// Server-only email sending helper for the "What Lovable Shipped" digest.
// Sends via Lovable Emails from noreply@notify.atlas.dahlingdigital.com.

import { sendLovableEmail } from "@lovable.dev/email-js";
import { SITE_ORIGIN } from "./canonical-meta";

const SENDER_DOMAIN = "notify.atlas.dahlingdigital.com";
const FROM_ADDRESS = `The Lovable Feature Atlas <noreply@${SENDER_DOMAIN}>`;

export interface OutboundEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag: "confirm" | "digest" | "preview";
}

const CREAM = "#FBF5E9";
const INK = "#0A0A0A";
const FOREST = "#0B3D2E";
const EMERALD = "#1F7A5A";
const GOLD = "#C9A961";
const MUTED = "#5B5B57";
const HAIRLINE = "#E3DDCE";

const wrapper = (bodyHtml: string, preheader: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>What Lovable Shipped</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${HAIRLINE};border-radius:6px;overflow:hidden;">
<tr><td style="padding:28px 32px 20px;border-bottom:1px solid ${HAIRLINE};">
  <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${EMERALD};">The Lovable Feature Atlas</div>
  <div style="margin-top:8px;font-size:22px;font-weight:600;color:${INK};letter-spacing:-0.01em;">What Lovable Shipped</div>
</td></tr>
<tr><td style="padding:28px 32px 32px;">
${bodyHtml}
</td></tr>
<tr><td style="padding:20px 32px 28px;border-top:1px solid ${HAIRLINE};background:${CREAM};">
  <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">Curated by Alicia Dahling · Dahling Digital</div>
  <div style="margin-top:6px;font-size:12px;color:${MUTED};line-height:1.6;">
    Independent, fan-built reference. Not affiliated with, endorsed by, or maintained by Lovable AB.
  </div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

export function renderConfirmEmail(confirmToken: string): { subject: string; html: string; text: string } {
  const confirmUrl = `${SITE_ORIGIN}/digest/confirm?token=${confirmToken}`;
  const subject = "Confirm your subscription to What Lovable Shipped";
  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK};">One click and you're on the list — a single email every Monday with every new Lovable feature from the past week. Nothing else.</p>
    <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:${MUTED};">If you didn't request this, ignore this email and no subscription will be created.</p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${FOREST};border-radius:4px;">
      <a href="${confirmUrl}" style="display:inline-block;padding:14px 22px;color:${CREAM};text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.01em;">Confirm subscription →</a>
    </td></tr></table>
    <p style="margin:24px 0 0;font-size:12px;color:${MUTED};word-break:break-all;">Or copy this link:<br><span style="color:${EMERALD};">${confirmUrl}</span></p>
  `;
  const text = `Confirm your subscription to What Lovable Shipped\n\n${confirmUrl}\n\nOne email a week. Every new Lovable feature. Nothing else.\nIf you didn't request this, ignore this email.`;
  return { subject, html: wrapper(body, "Confirm your subscription — one click."), text };
}

export interface DigestFeatureRow {
  id: string;
  name: string;
  category: string;
  status: string;
  tagline: string;
  release_date: string;
}

export function renderDigestEmail(features: DigestFeatureRow[], unsubscribeToken: string, periodEndIso: string): { subject: string; html: string; text: string } {
  const unsubUrl = `${SITE_ORIGIN}/digest/unsubscribe?token=${unsubscribeToken}`;
  const week = new Date(periodEndIso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

  let listHtml: string;
  let listText: string;

  if (features.length === 0) {
    listHtml = `
      <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:${INK};">Quiet week on the changelog — no new features landed.</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};">The catalog is still tracking every release. See you next Monday.</p>
    `;
    listText = "Quiet week on the changelog — no new features landed.\nThe catalog is still tracking every release. See you next Monday.";
  } else {
    const rows = features.map((f) => {
      const url = `${SITE_ORIGIN}/features/${f.id}`;
      const pillColor = f.status === "GA" ? GOLD : f.status === "Beta" ? EMERALD : MUTED;
      return `<tr><td style="padding:16px 0;border-bottom:1px solid ${HAIRLINE};">
        <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};margin-bottom:4px;">${escapeHtml(f.category)}</div>
        <a href="${url}" style="color:${INK};text-decoration:none;font-size:17px;font-weight:600;letter-spacing:-0.005em;">${escapeHtml(f.name)}</a>
        <span style="display:inline-block;margin-left:8px;padding:2px 8px;font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${pillColor};border:1px solid ${pillColor};border-radius:999px;vertical-align:middle;">${escapeHtml(f.status)}</span>
        <div style="margin-top:6px;font-size:14px;line-height:1.55;color:${MUTED};">${escapeHtml(f.tagline)}</div>
        <div style="margin-top:8px;"><a href="${url}" style="color:${EMERALD};text-decoration:none;font-size:13px;">Read on the atlas →</a></div>
      </td></tr>`;
    }).join("");
    listHtml = `
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${MUTED};">${features.length} new ${features.length === 1 ? "feature" : "features"} shipped this week.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    `;
    listText = features.map((f) => `— ${f.name} [${f.status}] · ${f.category}\n  ${f.tagline}\n  ${SITE_ORIGIN}/features/${f.id}`).join("\n\n");
  }

  const body = `
    <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};margin-bottom:16px;">Week ending ${week}</div>
    ${listHtml}
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid ${HAIRLINE};font-size:12px;color:${MUTED};line-height:1.6;">
      Browse the full catalog at <a href="${SITE_ORIGIN}" style="color:${EMERALD};text-decoration:none;">atlas.dahlingdigital.com</a><br>
      <a href="${unsubUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>
    </div>
  `;
  const preheader = features.length === 0 ? "Quiet week — nothing shipped." : `${features.length} new ${features.length === 1 ? "feature" : "features"} on Lovable this week.`;
  const subject = features.length === 0
    ? `What Lovable Shipped · quiet week (${week})`
    : `What Lovable Shipped · ${features.length} new ${features.length === 1 ? "feature" : "features"} (${week})`;
  const text = `What Lovable Shipped — week ending ${week}\n\n${listText}\n\nBrowse the full catalog: ${SITE_ORIGIN}\nUnsubscribe: ${unsubUrl}`;
  return { subject, html: wrapper(body, preheader), text };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Sender — sends via Lovable Emails from notify.atlas.dahlingdigital.com.
export async function sendEmail(msg: OutboundEmail): Promise<{ ok: boolean; provider: string; error?: string }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.error(`[digest-email] LOVABLE_API_KEY missing — cannot send [${msg.tag}] to=${msg.to}`);
    return { ok: false, provider: "lovable", error: "LOVABLE_API_KEY missing" };
  }
  try {
    const idempotency_key = `digest-${msg.tag}-${msg.to}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const res = await sendLovableEmail(
      {
        to: msg.to,
        from: FROM_ADDRESS,
        sender_domain: SENDER_DOMAIN,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        label: `digest-${msg.tag}`,
        purpose: "transactional",
        idempotency_key,
      },
      { apiKey, sendUrl: process.env.LOVABLE_SEND_URL },
    );
    return { ok: Boolean(res.success), provider: "lovable" };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[digest-email] send failed [${msg.tag}] to=${msg.to}:`, errorMsg);
    return { ok: false, provider: "lovable", error: errorMsg };
  }
}

