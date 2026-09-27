"""
Decode the QR code out of the rendered posters and confirm it points where it
should. A poster whose QR does not scan is worse than no QR at all.

    python tools/check_qr.py
"""

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTERS = ROOT / "posters"
EXPECTED = "https://yangran12.github.io/YRpublish/submit.html"

TARGETS = [
    POSTERS / "qr.png",
    POSTERS / "call-for-papers-zh.png",
    POSTERS / "call-for-papers-en.png",
    POSTERS / "call-for-papers-zh.pdf",
]


def main():
    try:
        import cv2
    except ImportError:
        sys.exit("opencv is not installed:  pip install opencv-python")

    detector = cv2.QRCodeDetector()
    failures = 0

    for path in TARGETS:
        if not path.exists():
            print(f"  skip  {path.name}  (not found)")
            continue

        img = cv2.imread(str(path))
        if img is None:
            print(f"  skip  {path.name}  (unreadable as an image)")
            continue

        text, points, _ = detector.detectAndDecode(img)

        if not text:
            print(f"  FAIL  {path.name}  — no QR code found")
            failures += 1
        elif text.rstrip("/") != EXPECTED.rstrip("/"):
            print(f"  FAIL  {path.name}  — decodes to {text!r}, expected {EXPECTED!r}")
            failures += 1
        else:
            print(f"  ok    {path.name}  ->  {text}")

    print()
    if failures:
        print(f"QR CHECK FAILED ({failures} file(s))")
        return 1
    print("QR CHECK: all codes decode to the right URL")
    return 0


if __name__ == "__main__":
    sys.exit(main())
