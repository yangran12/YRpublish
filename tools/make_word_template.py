"""
Generate templates/tdf-manuscript.docx — the Word manuscript template.

    python tools/make_word_template.py

Edit this file and re-run to change the template.
"""

import pathlib

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "templates" / "tdf-manuscript.docx"

BODY_FONT = "Times New Roman"
CJK_FONT = "SimSun"          # 宋体, used for any Chinese the author types
GREY = RGBColor(0x80, 0x80, 0x80)
ACCENT = RGBColor(0x14, 0x53, 0x2D)


# --------------------------------------------------------------------- helpers

def set_font(run, name=BODY_FONT, size=11, bold=False, italic=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color is not None:
        run.font.color.rgb = color
    # make sure the same font applies to Chinese characters
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    rfonts.set(qn("w:eastAsia"), CJK_FONT)


def para(doc, text="", align=None, space_after=8, space_before=0, indent=None):
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    pf = p.paragraph_format
    pf.space_after = Pt(space_after)
    pf.space_before = Pt(space_before)
    pf.line_spacing = 1.15
    if indent is not None:
        pf.left_indent = Cm(indent)
    if text:
        set_font(p.add_run(text))
    return p


def page_number(paragraph):
    """Append a live PAGE field."""
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.append(begin)
    run._r.append(instr)
    run._r.append(end)
    set_font(run, size=9, color=GREY)


# ----------------------------------------------------------------------- build

doc = Document()

# Page setup
for s in doc.sections:
    s.top_margin = Cm(2.5)
    s.bottom_margin = Cm(2.5)
    s.left_margin = Cm(2.5)
    s.right_margin = Cm(2.5)

# Body defaults
normal = doc.styles["Normal"]
normal.font.name = BODY_FONT
normal.font.size = Pt(11)
normal.element.rPr.rFonts.set(qn("w:eastAsia"), CJK_FONT)
normal.paragraph_format.space_after = Pt(8)
normal.paragraph_format.line_spacing = 1.15

# Heading 1 — numbered section headings
h1 = doc.styles["Heading 1"]
h1.font.name = BODY_FONT
h1.font.size = Pt(13)
h1.font.bold = True
h1.font.color.rgb = RGBColor(0, 0, 0)
h1.element.rPr.rFonts.set(qn("w:eastAsia"), CJK_FONT)
h1.paragraph_format.space_before = Pt(16)
h1.paragraph_format.space_after = Pt(6)

# ------------------------------------------------------------------- footer
footer_p = doc.sections[0].footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_font(
    footer_p.add_run(
        "Submitted to Transactions on Decarbonization Frontiers (TDF) · "
        "open review platform · https://yangran12.github.io/YRpublish/"
    ),
    size=8,
    color=GREY,
)
footer_p.add_run("  ·  ").font.size = Pt(8)
page_number(footer_p)

# ------------------------------------------------------------------ guidance
note = para(
    doc,
    "[ Delete this grey block before you submit ]\n"
    "Replace the text below with your own. Keep the section structure if it helps.\n"
    "Abstract: 150–250 words.  Keywords: 3–6.  Submit the PDF at\n"
    "https://yangran12.github.io/YRpublish/submit.html\n"
    "This is an open review platform, not a registered journal — see the site for what that means.",
    align=WD_ALIGN_PARAGRAPH.LEFT,
    space_after=18,
)
for r in note.runs:
    set_font(r, size=9, italic=True, color=GREY)

# --------------------------------------------------------------------- title
p = para(doc, "Your Manuscript Title Goes Here", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=10)
for r in p.runs:
    set_font(r, size=16, bold=True)

# ------------------------------------------------------------------- authors
p = para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
set_font(p.add_run("First Author"), size=11)
set_font(p.add_run("¹"), size=8)
set_font(p.add_run(", Second Author"), size=11)
set_font(p.add_run("¹"), size=8)
set_font(p.add_run(", Third Author"), size=11)
set_font(p.add_run("²"), size=8)

p = para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
set_font(p.add_run("¹"), size=8)
set_font(
    p.add_run(
        " School of Electrical and Automation Engineering, "
        "Nanjing Normal University, Nanjing 210023, China"
    ),
    size=9,
    italic=True,
)

p = para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
set_font(p.add_run("²"), size=8)
set_font(p.add_run(" Department, Institution, City, Country"), size=9, italic=True)

p = para(doc, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16)
set_font(p.add_run("Corresponding author: you@example.com"), size=9)

# ------------------------------------------------------------------ abstract
p = para(doc, "Abstract", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
for r in p.runs:
    set_font(r, size=11, bold=True, color=ACCENT)

p = para(
    doc,
    "Write your abstract here, 150 to 250 words. State the problem, the method, "
    "the main quantitative result, and why it matters. Avoid citations, undefined "
    "abbreviations and forward references to figures.",
    space_after=10,
    indent=0.8,
)
for r in p.runs:
    set_font(r, size=10)
p.paragraph_format.right_indent = Cm(0.8)

p = para(doc, space_after=18)
set_font(p.add_run("Keywords: "), size=10, bold=True)
set_font(p.add_run("electric vehicles; smart grid; low-carbon dispatch"), size=10)

# --------------------------------------------------------------------- body
doc.add_heading("Introduction", level=1)
para(
    doc,
    "Explain the problem and why it matters. Say what has been done before and "
    "what is still missing. End with a short statement of what this paper "
    "contributes — two or three sentences is enough, no more.",
)

doc.add_heading("Method", level=1)
para(
    doc,
    "Describe the method in enough detail that a reader could reproduce it "
    "without contacting you. Define every symbol the first time it appears. "
    "Number equations you refer to later.",
)

doc.add_heading("Case study", level=1)
para(
    doc,
    "Say what system you tested on, where the data came from, and what you "
    "assumed. If you used a public dataset, cite it.",
)

# table example
tbl = doc.add_table(rows=3, cols=3)
tbl.style = "Table Grid"
tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
rows = [
    ["Scenario", "Cost (CNY)", "Emissions (tCO₂)"],
    ["Baseline", "100 000", "42.1"],
    ["With EV scheduling", "91 400", "36.8"],
]
for i, row in enumerate(rows):
    for j, cell in enumerate(row):
        c = tbl.cell(i, j).paragraphs[0]
        c.alignment = WD_ALIGN_PARAGRAPH.CENTER if j else WD_ALIGN_PARAGRAPH.LEFT
        set_font(c.add_run(cell), size=10, bold=(i == 0))

para(doc, "Table 1. Headline results. Replace with your own numbers.",
     align=WD_ALIGN_PARAGRAPH.CENTER, space_before=6, space_after=16)
for r in doc.paragraphs[-1].runs:
    set_font(r, size=9, italic=True)

para(
    doc,
    "Refer to it as Table 1 in the running text. Every figure and table needs a "
    "reference like this.",
)

doc.add_heading("Discussion", level=1)
para(
    doc,
    "State the limitations honestly. What would change your conclusion? What did "
    "you not test? A reviewer will ask, so answer it first.",
)

doc.add_heading("Conclusion", level=1)
para(
    doc,
    "Two or three paragraphs at most. What did you show, and what follows from "
    "it. Do not introduce new results here.",
)

doc.add_heading("Acknowledgements", level=1)
para(
    doc,
    "Optional. Funding sources, data providers, people who helped but are not authors.",
    space_after=16,
)

# --------------------------------------------------------------- references
doc.add_heading("References", level=1)
for ref in [
    '[1] A. Author and B. Author, "Title of the cited paper," Journal Name, '
    "vol. 12, no. 3, pp. 45–67, 2026.",
    "[2] C. Author, Title of the Book. City: Publisher, 2025, ch. 4.",
    '[3] D. Author, "Title of the conference paper," in Proc. Conference Name, '
    "2026, pp. 1–6.",
]:
    p = para(doc, ref, space_after=6)
    for r in p.runs:
        set_font(r, size=10)

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size:,} bytes)")
