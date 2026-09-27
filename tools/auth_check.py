"""
Verify that the accounts wiring is live: the nav shows Sign in + Register,
the login page renders its form, and supabase-js actually loads.

    python tools/auth_check.py
    python tools/auth_check.py http://localhost:8000/

Behind a proxy set HTTPS_PROXY first.
"""

import os
import sys

DEFAULT_BASE = "https://yangran12.github.io/YRpublish/"


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

    print(f"target {base}\n")
    problems = []

    with sync_playwright() as p:
        browser = p.chromium.launch(**opts)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})

        # ---- 1. nav on the home page -------------------------------------
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.goto(base + "index.html", wait_until="load", timeout=45000)
        page.wait_for_timeout(2500)                      # let the SDK load

        nav_links = page.eval_on_selector_all(
            "#nav-auth a", "els => els.map(e => e.textContent.trim())")
        print(f"nav account links : {nav_links}")

        if len(nav_links) >= 2:
            print("  -> accounts ENABLED")
        else:
            problems.append("nav shows only one account link — Supabase may not be wired up")
            print("  -> accounts DISABLED or SDK failed to load")

        print(f"console errors    : {errors or 'none'}")
        if errors:
            problems.append(f"console errors on index: {errors}")

        # ---- 2. login page ------------------------------------------------
        page2 = ctx.new_page()
        errs2 = []
        page2.on("pageerror", lambda e: errs2.append(str(e)))
        page2.on("console", lambda m: errs2.append(m.text) if m.type == "error" else None)
        page2.goto(base + "login.html", wait_until="load", timeout=45000)
        page2.wait_for_timeout(2500)

        disabled_visible = page2.is_visible("#auth-disabled")
        tabbar_present = page2.is_visible(".tabs")
        signin_form = page2.is_visible("#signin-form")

        print(f"\nlogin page:")
        print(f"  'not configured' banner visible : {disabled_visible}")
        print(f"  tab bar visible                 : {tabbar_present}")
        print(f"  sign-in form visible            : {signin_form}")

        if disabled_visible:
            problems.append("login page still shows the 'accounts not enabled' banner")
        if not signin_form:
            problems.append("sign-in form is not visible")
        if not tabbar_present:
            problems.append("tab bar is missing")
        if errs2:
            problems.append(f"console errors on login: {errs2}")
        print(f"  console errors                  : {errs2 or 'none'}")

        # ---- 3. register tab ----------------------------------------------
        try:
            page2.click(".tab[data-tab='signup']")
            page2.wait_for_timeout(400)
            print(f"  register form visible after click: {page2.is_visible('#signup-form')}")
        except Exception as exc:
            problems.append(f"could not switch to the register tab: {exc}")

        browser.close()

    print()
    if problems:
        print("PROBLEMS:")
        for q in problems:
            print("  -", q)
        return 1
    print("AUTH WIRING: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
