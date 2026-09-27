import re, pathlib

root = pathlib.Path(".")
html_all = "\n".join(p.read_text(encoding="utf-8") for p in root.glob("*.html"))
js_all   = "\n".join(p.read_text(encoding="utf-8") for p in (root/"assets/js").glob("*.js"))

html_ids = set(re.findall(r'\bid="([^"]+)"', html_all))
js_ids   = set(re.findall(r'\bid="([^"]+)"', js_all))          # ids JS injects
js_ref   = set(re.findall(r'getElementById\(\s*"([^"]+)"', js_all))

known = html_ids | js_ids
problems = sorted(js_ref - known)

print("ids in HTML      :", len(html_ids))
print("ids injected by JS:", len(js_ids))
print("ids JS looks up  :", len(js_ref))
print()
if problems:
    print("!! JS looks up ids that exist nowhere:")
    for i in problems: print("   ", i)
else:
    print("OK  every getElementById target exists")

# selector sanity: classes used by querySelector
sel = set(re.findall(r'querySelectorAll?\(\s*"([^"]+)"', js_all))
print()
print("selectors used by JS:")
for s in sorted(sel):
    cls = re.findall(r'\.([A-Za-z0-9_-]+)', s)
    attr = re.findall(r'\[([a-zA-Z-]+)', s)
    hit = all(('class="'+c in html_all) or (c in html_all) for c in cls) if cls else True
    print("   {:38} {}".format(s, "" if hit else "<-- class not found in HTML"))
