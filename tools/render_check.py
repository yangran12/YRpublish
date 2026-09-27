"""
Render every page headlessly and report console errors + screenshots.

    python tools/render_check.py            # from the repo root

Starts its own static server, so nothing else needs to be running.
Requires: pip install playwright  &&  playwright install msedge
"""

import pathlib
import socket
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = [
    "index.html", "papers.html", "submit.html", "templates.html",
    "review.html", "about.html", "login.html", "dashboard.html",
]
SHOTS = ROOT / "shots"


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def serve(port):
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a, **k: None          # keep the output clean
    httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("playwright is not installed:  pip install playwright && playwright install msedge")

    port = free_port()
    httpd = serve(port)
    base = f"http://127.0.0.1:{port}/"
    SHOTS.mkdir(exist_ok=True)

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel="msedge", headless=True)
            ctx = browser.new_context(viewport={"width": 1280, "height": 900})

            for name in PAGES:
                page = ctx.new_page()
                logs = []
                page.on("console", lambda m: logs.append((m.type, m.text)))
                page.on("pageerror", lambda e: logs.append(("pageerror", str(e))))
                page.goto(base + name, wait_until="load")
                page.wait_for_timeout(1200)

                bad = [l for l in logs if l[0] in ("error", "pageerror")]
                total += len(bad)
                status = "OK" if not bad else f"{len(bad)} ERROR(S)"
                print(f"=== {name:16} {status}")
                for kind, text in bad:
                    print(f"      [{kind}] {text[:250]}")
                for kind, text in logs:
                    if kind == "warning":
                        print(f"      (warn) {text[:150]}")

                try:
                    page.screenshot(path=str(SHOTS / (name.replace(".html", "") + ".png")),
                                    timeout=15000)
                except Exception as exc:
                    print(f"      screenshot failed: {str(exc)[:80]}")
                page.close()

            # --- config-driven content actually got filled in ---------------
            page = ctx.new_page()
            page.goto(base + "about.html", wait_until="load")
            page.wait_for_timeout(1200)
            orcid = page.eval_on_selector(
                "a[data-orcid]",
                "el => ({href: el.getAttribute('href'), text: el.textContent.trim()})",
            )
            editor = page.inner_text("[data-cfg='editorName']").strip()
            print(f"\nORCID link   : {orcid['text']}  ->  {orcid['href']}")
            print(f"Editor name  : {editor}")
            if "orcid.org/" not in (orcid["href"] or ""):
                print("      !! ORCID href was not filled in")
                total += 1
            if not editor:
                print("      !! editor name was not filled in")
                total += 1
            page.close()

            browser.close()
    finally:
        httpd.shutdown()

    print(f"\nTOTAL CONSOLE ERRORS: {total}")
    print(f"screenshots -> {SHOTS}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
