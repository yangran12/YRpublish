"""
Generate posters/header-art.svg — the abstract grid motif behind the poster title.

Deterministic: same seed, same artwork, every time. Vector, so it stays crisp
at any print size.

    python tools/make_header_art.py
"""

import math
import pathlib
import random

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "posters" / "header-art.svg"

W, H = 1240, 420
SEED = 20260927
NODES = 34

GREEN_DARK = "#0e3a20"
GREEN = "#14532d"
MINT = "#8fd6ab"


def build():
    rng = random.Random(SEED)

    # Nodes cluster to the right so the title on the left stays clean.
    nodes = [(rng.uniform(470, 1260), rng.uniform(-40, 460)) for _ in range(NODES)]

    def d(a, b):
        return math.hypot(a[0] - b[0], a[1] - b[1])

    edges = set()
    for i, n in enumerate(nodes):
        near = sorted(range(len(nodes)), key=lambda j: d(n, nodes[j]))
        for j in near[1:3]:                       # link to the two nearest
            edges.add(tuple(sorted((i, j))))

    p = []
    p.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'width="{W}" height="{H}">'
    )
    p.append(
        "<defs>"
        f'<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{GREEN}"/>'
        f'<stop offset="1" stop-color="{GREEN_DARK}"/>'
        f"</linearGradient>"
        f'<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0" stop-color="{GREEN}" stop-opacity="1"/>'
        f'<stop offset="0.30" stop-color="{GREEN}" stop-opacity="1"/>'
        f'<stop offset="0.72" stop-color="{GREEN}" stop-opacity="0"/>'
        f"</linearGradient>"
        "</defs>"
    )

    p.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')

    # faint measurement grid
    p.append('<g stroke="#ffffff" stroke-opacity="0.045" stroke-width="1">')
    for x in range(0, W + 1, 62):
        p.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}"/>')
    for y in range(0, H + 1, 62):
        p.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}"/>')
    p.append("</g>")

    # the network
    p.append(f'<g stroke="{MINT}" stroke-opacity="0.32" stroke-width="1.4" fill="none">')
    for i, j in sorted(edges):
        x1, y1 = nodes[i]
        x2, y2 = nodes[j]
        p.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
    p.append("</g>")

    # a few hubs, drawn as concentric rings
    hubs = sorted(range(len(nodes)), key=lambda i: -sum(
        1 for e in edges if i in e))[:4]
    p.append(f'<g stroke="{MINT}" fill="none">')
    for i in hubs:
        x, y = nodes[i]
        for r, op in ((16, 0.45), (30, 0.22), (48, 0.11)):
            p.append(
                f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" '
                f'stroke-opacity="{op}" stroke-width="1.4"/>'
            )
    p.append("</g>")

    # nodes
    p.append(f'<g fill="{MINT}">')
    for i, (x, y) in enumerate(nodes):
        r = 4.2 if i in hubs else rng.uniform(1.6, 2.9)
        op = 0.85 if i in hubs else rng.uniform(0.35, 0.6)
        p.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill-opacity="{op:.2f}"/>')
    p.append("</g>")

    # fade the whole motif out toward the left, under the title
    p.append(f'<rect width="{W}" height="{H}" fill="url(#fade)"/>')
    p.append("</svg>")

    return "\n".join(p)


def main():
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(build(), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
