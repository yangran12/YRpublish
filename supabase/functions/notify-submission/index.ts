/**
 * Supabase Edge Function — notify-submission
 * ---------------------------------------------------------------------------
 * Emails the editorial office whenever a row lands in public.submissions.
 *
 * Triggered by a Database Webhook on INSERT (see docs/submission-alerts.md).
 * Sends through the editorial office's own mailbox, so authors' details go to
 * the address they already handed over for correspondence — not to a third
 * party.
 *
 * Environment variables (Supabase → Edge Functions → Secrets):
 *   MAIL_HOST   default smtp.163.com
 *   MAIL_PORT   default 465
 *   MAIL_USER   the full mailbox address you send from
 *   MAIL_PASS   the SMTP authorisation code (NOT your login password)
 *   MAIL_TO     where alerts go; defaults to MAIL_USER
 *   SITE_URL    link shown in the email
 *   HOOK_SECRET optional shared secret; if set, the webhook must send it
 */

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const MAIL_HOST = Deno.env.get("MAIL_HOST") ?? "smtp.163.com";
const MAIL_PORT = Number(Deno.env.get("MAIL_PORT") ?? "465");
const MAIL_USER = Deno.env.get("MAIL_USER") ?? "";
const MAIL_PASS = Deno.env.get("MAIL_PASS") ?? "";
const MAIL_TO = Deno.env.get("MAIL_TO") ?? MAIL_USER;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://yangran12.github.io/YRpublish";
const HOOK_SECRET = Deno.env.get("HOOK_SECRET") ?? "";

interface Submission {
  id?: string;
  title?: string;
  authors?: string;
  affiliation?: string | null;
  contact_email?: string | null;
  abstract?: string | null;
  keywords?: string | null;
  file_url?: string | null;
  status?: string;
  created_at?: string;
}

interface WebhookPayload {
  type?: string;
  table?: string;
  schema?: string;
  record?: Submission;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const dash = (v: string | null | undefined, fallback = "—") =>
  v && v.trim() ? v.trim() : fallback;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405);
  }

  if (HOOK_SECRET && req.headers.get("x-tdf-secret") !== HOOK_SECRET) {
    return json({ ok: false, error: "bad secret" }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "body was not JSON" }, 400);
  }

  const r = payload?.record;
  if (!r?.title) {
    return json({ ok: false, error: "no record in payload" }, 400);
  }

  if (!MAIL_USER || !MAIL_PASS) {
    return json({ ok: false, error: "MAIL_USER / MAIL_PASS not set" }, 500);
  }

  const abstract = (r.abstract ?? "").trim();
  const abstractShort = abstract.length > 1200
    ? abstract.slice(0, 1200) + " …"
    : abstract;

  const received = r.created_at
    ? new Date(r.created_at).toISOString().replace("T", " ").slice(0, 16) + " UTC"
    : new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

  // Plain-text alternative — keep the subject ASCII so no client mangles it.
  const text = [
    "A new manuscript has been submitted to TDF.",
    "",
    `Title        ${dash(r.title)}`,
    `Authors      ${dash(r.authors)}`,
    `Affiliation  ${dash(r.affiliation)}`,
    `Contact      ${dash(r.contact_email)}`,
    `Keywords     ${dash(r.keywords)}`,
    `Manuscript   ${dash(r.file_url)}`,
    `Received     ${received}`,
    "",
    "Abstract",
    "--------",
    dash(abstract, "(none supplied)"),
    "",
    `Submission id: ${dash(r.id)}`,
    "",
    `Editorial dashboard: https://supabase.com/dashboard`,
    `Site: ${SITE_URL}`,
    "",
    "You committed to initial screening within 3 working days.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,'Segoe UI','Microsoft YaHei',sans-serif;color:#16181d;line-height:1.6;max-width:640px">
  <div style="border-top:3px solid #14532d;padding-top:16px">
    <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8b919c;margin:0 0 6px">New submission</p>
    <h2 style="font-family:Georgia,serif;margin:0 0 18px;font-size:20px">${esc(dash(r.title))}</h2>
    <table style="border-collapse:collapse;font-size:14px">
      ${[
        ["Authors", dash(r.authors)],
        ["Affiliation", dash(r.affiliation)],
        ["Contact", dash(r.contact_email)],
        ["Keywords", dash(r.keywords)],
        ["Received", received],
      ].map(([k, v]) =>
        `<tr><td style="padding:3px 16px 3px 0;color:#8b919c;white-space:nowrap">${k}</td><td style="padding:3px 0">${esc(v)}</td></tr>`
      ).join("")}
    </table>
    ${r.file_url
      ? `<p style="margin:18px 0 0"><a href="${esc(r.file_url)}" style="background:#14532d;color:#fff;text-decoration:none;padding:9px 16px;border-radius:3px;font-size:14px">Open the manuscript</a></p>`
      : ""}
    ${abstract
      ? `<p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8b919c;margin:26px 0 6px">Abstract</p>
         <p style="font-size:14px;color:#565c68;margin:0;white-space:pre-wrap">${esc(abstractShort)}</p>`
      : ""}
    <p style="border-top:1px solid #e3e5e9;margin-top:26px;padding-top:14px;font-size:12px;color:#8b919c">
      Submission id ${esc(dash(r.id))} &middot;
      <a href="https://supabase.com/dashboard" style="color:#14532d">Supabase dashboard</a>
      &middot; <a href="${SITE_URL}" style="color:#14532d">${SITE_URL}</a><br>
      You committed to initial screening within 3 working days.
    </p>
  </div>
</body></html>`;

  const client = new SMTPClient({
    connection: {
      hostname: MAIL_HOST,
      port: MAIL_PORT,
      tls: true,
      auth: { username: MAIL_USER, password: MAIL_PASS },
    },
  });

  try {
    await client.send({
      from: MAIL_USER,
      to: MAIL_TO,
      subject: "[TDF] New submission received",
      content: text,
      html,
    });
  } catch (err) {
    console.error("SMTP send failed:", err);
    return json({ ok: false, error: String(err) }, 500);
  } finally {
    try {
      await client.close();
    } catch { /* already closed */ }
  }

  return json({ ok: true });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
