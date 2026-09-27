"""
End-to-end test against the LIVE site, driving the real UI:
    register -> land on dashboard -> submit a manuscript -> see it listed.

Creates one throwaway account. Delete it afterwards in
Supabase -> Authentication -> Users; the submission cascades away with it.

    python tools/e2e_check.py
    python tools/e2e_check.py http://localhost:8000/

Set HTTPS_PROXY if you are behind a proxy.
"""

import os
import sys
import time

DEFAULT_BASE = "https://yangran12.github.io/YRpublish/"

TEST_EMAIL = os.environ.get("TDF_TEST_EMAIL") or f"tdf-selftest-{int(time.time())}@example.com"
TEST_PASS = os.environ.get("TDF_TEST_PASS") or "Selftest!2026"
TEST_NAME = "TDF Selftest"
TEST_AFFIL = "Nanjing Normal University"

# Reuse an existing account instead of registering a new one every run:
#   $env:TDF_TEST_EMAIL = "tdf-selftest-...@example.com"
REUSE = bool(os.environ.get("TDF_TEST_EMAIL"))

PAPER = {
    "title": "端到端测试稿件 Self-test manuscript (safe to delete)",
    "authors": "TDF Selftest",
    "affil": "Nanjing Normal University",
    "abstract": "This row exists only to verify that the submission pipeline works "
                "end to end. It is safe to delete.",
    "keywords": "self-test",
    "link": "https://zenodo.org/records/0000000",
}


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("playwright is not installed:  pip install playwright && playwright install msedge")

    base = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BASE
    if not base.endswith("/"):
        base += "/"

    proxy_url = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    opts = {"channel": "msedge", "headless": True}
    if proxy_url:
        opts["proxy"] = {"server": proxy_url}
        print(f"using proxy {proxy_url}")

    print(f"target {base}")
    print(f"test account {TEST_EMAIL}\n")

    steps = []
    failed = []

    def step(label, ok, detail=""):
        steps.append((label, ok, detail))
        print(f"  [{'PASS' if ok else 'FAIL'}] {label}" + (f"  — {detail}" if detail else ""))
        if not ok:
            failed.append(label)

    with sync_playwright() as p:
        browser = p.chromium.launch(**opts)
        ctx = browser.new_context(viewport={"width": 1280, "height": 950})

        # ------------------------------------------------- register or sign in
        print("1. " + ("Sign in (existing account)" if REUSE else "Register"))
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        page.goto(base + "login.html", wait_until="load", timeout=45000)
        page.wait_for_timeout(2500)

        step("login page is not in 'disabled' mode", not page.is_visible("#auth-disabled"))
        step("sign-in form is rendered", page.is_visible("#signin-form"))

        if REUSE:
            page.fill("#in-email", TEST_EMAIL)
            page.fill("#in-password", TEST_PASS)
            page.click("#signin-form button[type=submit]")
            landed = "signing in lands on the dashboard"
        else:
            page.click(".tab[data-tab='signup']")
            page.fill("#up-name", TEST_NAME)
            page.fill("#up-affil", TEST_AFFIL)
            page.select_option("#up-role", "student")
            page.fill("#up-email", TEST_EMAIL)
            page.fill("#up-password", TEST_PASS)
            page.fill("#up-password2", TEST_PASS)
            page.click("#signup-form button[type=submit]")
            landed = "registering lands on the dashboard"

        try:
            page.wait_for_url("**/dashboard.html", timeout=25000)
            step(landed, True)
        except Exception:
            msg = page.inner_text("#auth-msg") if page.is_visible("#auth-msg") else "(no message)"
            step(landed, False, msg.strip()[:120])

        # --------------------------------------------------------- dashboard
        print("\n2. Dashboard")
        page.wait_for_timeout(3000)
        who = page.inner_text("#dash-who") if page.is_visible("#dash-who") else ""
        # dashboard shows the account's display name when set, else the email
        step("signed in as the expected account",
             (TEST_EMAIL in who) or (TEST_NAME in who), who.strip()[:60])

        # ------------------------------------------------------------ submit
        print("\n3. Submit a manuscript")
        page.goto(base + "submit.html", wait_until="load", timeout=45000)
        page.wait_for_timeout(2500)

        step("submit form is enabled", page.is_enabled("#submit-btn"))
        page.fill("#f-title", PAPER["title"])
        page.fill("#f-authors", PAPER["authors"])
        page.fill("#f-affil", PAPER["affil"])
        page.fill("#f-abstract", PAPER["abstract"])
        page.fill("#f-keywords", PAPER["keywords"])
        page.fill("#f-link", PAPER["link"])
        page.click("#submit-btn")

        page.wait_for_timeout(4000)
        msg = page.inner_text("#submit-msg").strip() if page.is_visible("#submit-msg") else ""
        step("submission accepted", "Received" in msg or "收到" in msg, msg[:110])
        # catches i18n placeholders that were never substituted, e.g. "within {days} days"
        step("no unsubstituted {placeholders} in the message", "{" not in msg,
             msg[:110] if "{" in msg else "")

        # ----------------------------------------------------- read it back
        print("\n4. Read it back")
        page.goto(base + "dashboard.html", wait_until="load", timeout=45000)
        page.wait_for_timeout(3500)

        step("submissions table is shown", page.is_visible("#dash-mount"))
        body = page.inner_text("#dash-mount") if page.is_visible("#dash-mount") else ""
        step("the manuscript appears in the list", PAPER["title"] in body)
        # the badge is styled text-transform:uppercase, so compare case-insensitively
        step("status badge reads 'Submitted'",
             "submitted" in body.lower() or "已提交" in body)

        if errors:
            step("no console errors", False, "; ".join(errors)[:180])

        browser.close()

    # ------------------------------------------------------------- summary
    print("\n" + "=" * 58)
    if failed:
        print(f"E2E: {len(failed)} STEP(S) FAILED")
        for f in failed:
            print("  -", f)
        print(f"\ntest account left behind: {TEST_EMAIL}")
        return 1

    print("E2E: ALL STEPS PASSED")
    print("\nRegistration, sign-in, submission storage and retrieval all work.")
    print("\nClean up the test data:")
    print("  Supabase -> Authentication -> Users -> delete " + TEST_EMAIL)
    print("  (the test manuscript is removed automatically by ON DELETE CASCADE)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
