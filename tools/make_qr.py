"""
Generate the QR code used on posters and slides.

    python tools/make_qr.py

Writes posters/qr.svg (crisp at any size) and posters/qr.png (for pasting
into Word, WeChat, etc.).
"""

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "posters"

# The QR on the poster says "扫码投稿", so it lands on the submission page
# itself rather than the home page. Change back to the bare site root if you
# would rather people read what TDF is before they land on a form.
URL = "https://yangran12.github.io/YRpublish/submit.html"


def main():
    try:
        import segno
    except ImportError:
        sys.exit("segno is not installed:  pip install segno")

    OUT_DIR.mkdir(exist_ok=True)

    qr = segno.make(URL, error="h")          # high error correction — survives
                                             # being printed small or photographed
    svg_path = OUT_DIR / "qr.svg"
    png_path = OUT_DIR / "qr.png"

    # Dark green modules on white, to sit inside the poster palette.
    # border=4 is the quiet zone the QR spec requires — without it scanners
    # struggle, especially on a tinted background.
    qr.save(svg_path, scale=10, dark="#14532d", light="#ffffff", border=4)
    qr.save(png_path, scale=20, dark="#14532d", light="#ffffff", border=4)

    print(f"target : {URL}")
    print(f"wrote  : {svg_path.relative_to(ROOT)}  ({svg_path.stat().st_size:,} bytes)")
    print(f"wrote  : {png_path.relative_to(ROOT)}  ({png_path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
