"""
Verify the language toggle end to end: switch to Chinese, back to English,
and report any console errors along the way.

    python tools/lang_check.py            # from the repo root
"""

import pathlib
import socket
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHOTS = ROOT / "shots"


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("playwright is not installed:  pip install playwright && playwright install msedge")

    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]

    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a, **k: None
    httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{port}/"
    SHOTS.mkdir(exist_ok=True)

    ok = True
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="msedge", headless=True)
            page = browser.new_context(viewport={"width": 1280, "height": 900}).new_page()

            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

            page.goto(base + "index.html", wait_until="load")
            page.click("#lang-toggle")                      # -> Chinese
            page.wait_for_timeout(700)

            lang = page.get_attribute("html", "lang")
            h1 = page.inner_text("h1[data-i18n='home.title']")
            nav = " | ".join(
                page.inner_text(f"a[data-i18n='{k}']")
                for k in ("nav.home", "nav.papers", "nav.submit", "nav.review", "nav.about")
            )
            btn = page.inner_text("#lang-toggle")

            print(f"html lang      : {lang}")
            print(f"h1 (zh)        : {h1}")
            print(f"nav (zh)       : {nav}")
            print(f"toggle label   : {btn}")

            ok = ok and lang == "zh-CN" and "学生" in h1 and nav.count("|") == 4 and btn == "EN"

            page.screenshot(path=str(SHOTS / "index-zh.png"), timeout=15000)

            page.click("#lang-toggle")                      # -> back to English
            page.wait_for_timeout(500)
            back = page.inner_text("h1[data-i18n='home.title']")
            print(f"h1 (back)      : {back}")
            ok = ok and back.startswith("A student-run")

            print(f"console errors : {errors or 'none'}")
            ok = ok and not errors

            browser.close()
    finally:
        httpd.shutdown()

    print("\nLANGUAGE TOGGLE:", "OK" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
