"""
Email the editorial office about any submission that has not been announced yet.

Runs in two places, from the same code:
  * GitHub Actions, on a schedule (see .github/workflows/submission-alerts.yml)
  * your own machine, by hand:  python tools/check_submissions.py

How it stays correct without any state of its own: it looks for rows whose
notified_at is still NULL, mails them, then stamps notified_at. If a mail fails
the stamp is not written, so the next run picks that row up again. Nothing is
missed and nothing is sent twice.

Required environment variables (never commit these):
    SUPABASE_URL             https://<ref>.supabase.co
    SUPABASE_SERVICE_KEY     the service_role key — server-side only
    MAIL_USER                full mailbox address to send from
    MAIL_PASS                SMTP authorisation code (not the login password)
    MAIL_TO                  where alerts go; defaults to MAIL_USER
Optional:
    MAIL_HOST                default smtp.163.com
    MAIL_PORT                default 465
    SITE_URL                 shown in the mail
    DRY_RUN                  set to 1 to print instead of sending
"""

from __future__ import annotations

import json
import os
import smtplib
import ssl
import sys
import urllib.error
import urllib.request
from email.message import EmailMessage
from email.utils import formatdate

SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or ""
MAIL_HOST = os.environ.get("MAIL_HOST") or "smtp.163.com"
MAIL_PORT = int(os.environ.get("MAIL_PORT") or "465")
MAIL_USER = os.environ.get("MAIL_USER") or ""
MAIL_PASS = os.environ.get("MAIL_PASS") or ""
MAIL_TO = os.environ.get("MAIL_TO") or MAIL_USER
SITE_URL = os.environ.get("SITE_URL") or "https://yangran12.github.io/YRpublish"
DRY_RUN = os.environ.get("DRY_RUN") == "1"

SELECT_COLS = "id,title,authors,affiliation,contact_email,abstract,keywords,file_url,created_at"


def die(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def check_config() -> None:
    missing = [
        name
        for name, value in (
            ("SUPABASE_URL", SUPABASE_URL),
            ("SUPABASE_SERVICE_KEY", SERVICE_KEY),
            ("MAIL_USER", MAIL_USER),
            ("MAIL_PASS", MAIL_PASS),
        )
        if not value
    ]
    if missing:
        die("missing environment variable(s): " + ", ".join(missing))


def rest(method: str, path: str, body=None, prefer: str | None = None):
    """Call the Supabase REST API with the service key."""
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw.strip() else []
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:400]
        raise RuntimeError(f"Supabase {method} {path} -> HTTP {e.code}: {detail}") from None


def fetch_pending() -> list[dict]:
    return rest(
        "GET",
        f"submissions?select={SELECT_COLS}"
        f"&notified_at=is.null&order=created_at.asc&limit=50",
    )


def mark_notified(row_id: str) -> None:
    rest(
        "PATCH",
        f"submissions?id=eq.{row_id}",
        body={"notified_at": "now()"},
        prefer="return=minimal",
    )


def dash(value, fallback: str = "—") -> str:
    text = (value or "").strip() if isinstance(value, str) else value
    return text if text else fallback


def build_message(r: dict) -> EmailMessage:
    title = dash(r.get("title"))
    abstract = (r.get("abstract") or "").strip()
    if len(abstract) > 1200:
        abstract = abstract[:1200] + " …"

    received = dash(r.get("created_at"))
    link = r.get("file_url")

    msg = EmailMessage()
    # Keep the Subject ASCII so no client mangles the encoding.
    msg["Subject"] = "[TDF] New submission received"
    msg["From"] = MAIL_USER
    msg["To"] = MAIL_TO
    msg["Date"] = formatdate(localtime=True)

    rows = [
        ("Title", title),
        ("Authors", dash(r.get("authors"))),
        ("Affiliation", dash(r.get("affiliation"))),
        ("Contact", dash(r.get("contact_email"))),
        ("Keywords", dash(r.get("keywords"))),
        ("Manuscript", dash(link)),
        ("Received", received),
    ]

    text = "\n".join(
        ["A new manuscript has been submitted to TDF.", ""]
        + [f"{k:<12} {v}" for k, v in rows]
        + ["", "Abstract", "-" * 8, dash(abstract, "(none supplied)"), "",
           f"Submission id: {dash(r.get('id'))}", f"Site: {SITE_URL}", "",
           "You committed to initial screening within 3 working days."]
    )

    html_rows = "".join(
        f'<tr><td style="padding:3px 16px 3px 0;color:#8b919c;white-space:nowrap">{k}</td>'
        f'<td style="padding:3px 0">{v}</td></tr>'
        for k, v in rows
    )
    html = f"""<!DOCTYPE html><html><body style="font-family:-apple-system,'Segoe UI','Microsoft YaHei',sans-serif;color:#16181d;line-height:1.6;max-width:640px">
<div style="border-top:3px solid #14532d;padding-top:16px">
  <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8b919c;margin:0 0 6px">New submission</p>
  <h2 style="font-family:Georgia,serif;margin:0 0 18px;font-size:20px">{title}</h2>
  <table style="border-collapse:collapse;font-size:14px">{html_rows}</table>
  <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8b919c;margin:26px 0 6px">Abstract</p>
  <p style="font-size:14px;color:#565c68;margin:0;white-space:pre-wrap">{dash(abstract, "(none supplied)")}</p>
  <p style="border-top:1px solid #e3e5e9;margin-top:26px;padding-top:14px;font-size:12px;color:#8b919c">
    Submission id {dash(r.get('id'))} &middot; <a href="{SITE_URL}" style="color:#14532d">{SITE_URL}</a><br>
    You committed to initial screening within 3 working days.
  </p>
</div></body></html>"""

    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    return msg


def send(msg: EmailMessage) -> None:
    ctx = ssl.create_default_context()
    with smtplib.SMTP_SSL(MAIL_HOST, MAIL_PORT, context=ctx, timeout=30) as s:
        s.login(MAIL_USER, MAIL_PASS)
        s.send_message(msg)


def main() -> int:
    check_config()

    try:
        pending = fetch_pending()
    except RuntimeError as e:
        die(str(e))

    if not pending:
        print("no new submissions")
        return 0

    print(f"{len(pending)} new submission(s)")
    failures = 0

    for r in pending:
        label = f"{dash(r.get('title'))[:60]}  <{dash(r.get('contact_email'))}>"
        if DRY_RUN:
            print(f"  DRY RUN would mail: {label}")
            continue
        try:
            send(build_message(r))
            mark_notified(r["id"])
            print(f"  mailed  {label}")
        except Exception as e:                      # noqa: BLE001 - report and carry on
            failures += 1
            # Deliberately NOT marking it notified: the next run retries.
            print(f"  FAILED  {label}\n          {type(e).__name__}: {e}", file=sys.stderr)

    if failures:
        print(f"\n{failures} of {len(pending)} failed; those rows stay queued", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
