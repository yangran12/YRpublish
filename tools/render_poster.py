"""
Render a poster HTML file to a high-resolution PNG (and a PDF for printing).

    python tools/render_poster.py                       # renders every poster
    python tools/render_poster.py call-for-papers-zh    # renders just one

Output lands next to the source in posters/.
"""

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTERS = ROOT / "posters"

# CSS pixels of the poster body; 2x gives a 2480x3508 PNG (A4 at 300 dpi-ish)
VIEWPORT = {"width": 1240, "height": 1754}
SCALE = 2


def render(page, stem):
    src = POSTERS / f"{stem}.html"
    if not src.exists():
        print(f"  skip {stem}: no such file")
        return False

    png = POSTERS / f"{stem}.png"
    pdf = POSTERS / f"{stem}.pdf"

    page.goto(src.as_uri(), wait_until="networkidle")
    page.wait_for_timeout(500)
    page.screenshot(path=str(png), full_page=False)
    page.pdf(path=str(pdf), width="210mm", height="297mm",
             print_background=True, margin={"top": "0", "right": "0",
                                            "bottom": "0", "left": "0"})

    from PIL import Image
    with Image.open(png) as im:
        dims = f"{im.width}x{im.height}"
    print(f"  {stem:26} -> {png.name}  {dims}  {png.stat().st_size/1024:.0f} KB"
          f"   + {pdf.name}")
    return True


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("playwright is not installed:  pip install playwright && playwright install msedge")

    if len(sys.argv) > 1:
        stems = sys.argv[1:]
    else:
        stems = sorted(p.stem for p in POSTERS.glob("*.html"))

    print("rendering:")
    ok = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_context(
            viewport=VIEWPORT, device_scale_factor=SCALE
        ).new_page()
        for stem in stems:
            if render(page, stem):
                ok += 1
        browser.close()

    print(f"\n{ok} poster(s) written to {POSTERS}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
