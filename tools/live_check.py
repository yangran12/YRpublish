"""
Verify the deployed site: load every page from the live URL, report console
errors, and confirm the language toggle works.

    python tools/live_check.py
    python tools/live_check.py https://example.com/site/     # override the base

Behind a proxy?  Set HTTPS_PROXY, e.g.
    $env:HTTPS_PROXY = "http://127.0.0.1:7890"
"""

import os
import sys

DEFAULT_BASE = "https://yangran12.github.io/YRpublish/"
PAGES = ["index.html", "papers.html", "submit.html", "templates.html",
         "review.html", "about.html", "login.html", "dashboard.html"]


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("playwright is not installed:  pip install playwright && playwright install msedge")

    base = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BASE
    if not base.endswith("/"):
        base += "/"

    proxy_url = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    launch_opts = {"channel": "msedge", "headless": True}
    if proxy_url:
        launch_opts["proxy"] = {"server": proxy_url}
        print(f"using proxy {proxy_url}")

    print(f"target {base}\n")
    total = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(**launch_opts)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})

        for name in PAGES:
            page = ctx.new_page()
            logs = []
            page.on("console", lambda m: logs.append((m.type, m.text)))
            page.on("pageerror", lambda e: logs.append(("pageerror", str(e))))

            resp = page.goto(base + name, wait_until="load", timeout=45000)
            page.wait_for_timeout(1200)

            bad = [l for l in logs if l[0] in ("error", "pageerror")]
            total += len(bad)
            code = resp.status if resp else "???"
            print(f"=== {name:16} HTTP {code}  {'OK' if not bad else f'{len(bad)} ERROR(S)'}")
            for kind, text in bad:
                print(f"      [{kind}] {text[:200]}")
            page.close()

        # language toggle, against the live index
        page = ctx.new_page()
        page.goto(base + "index.html", wait_until="load", timeout=45000)
        page.wait_for_timeout(800)
        page.click("#lang-toggle")
        page.wait_for_timeout(700)
        lang = page.get_attribute("html", "lang")
        h1 = page.inner_text("h1[data-i18n='home.title']")
        print(f"\nlanguage toggle -> html lang = {lang}")
        print(f"                   h1 = {h1[:44]}")
        ok = lang == "zh-CN"
        page.close()

        browser.close()

    print(f"\nCONSOLE ERRORS: {total}")
    print("LANGUAGE TOGGLE:", "OK" if ok else "FAILED")
    return 0 if (total == 0 and ok) else 1


if __name__ == "__main__":
    sys.exit(main())
